import os
import hashlib
import json
from abc import ABC, abstractmethod
import redis
from app.core.config import settings

# Initialize Redis client safely
try:
    redis_client = redis.from_url(settings.REDIS_URL, socket_timeout=2.0)
    redis_client.ping()
    redis_available = True
except Exception:
    redis_client = {}
    redis_available = False

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str) -> str:
        pass

class GroqProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate(self, prompt: str) -> str:
        if not self.api_key:
            raise ValueError("Groq API key missing")
        from groq import Groq
        client = Groq(api_key=self.api_key)
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            max_tokens=100
        )
        return chat_completion.choices[0].message.content.strip()

class OpenAICompatibleProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate(self, prompt: str) -> str:
        if not self.api_key:
            raise ValueError("OpenAI API key missing")
        from openai import OpenAI
        client = OpenAI(api_key=self.api_key)
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-3.5-turbo",
            max_tokens=100
        )
        return chat_completion.choices[0].message.content.strip()

class FallbackProvider(LLMProvider):
    def generate(self, prompt: str) -> str:
        return ""

class LLMService:
    def __init__(self):
        self.provider_name = settings.LLM_PROVIDER
        self.prompt_version = settings.PROMPT_VERSION
        self.provider = self._init_provider()

    def _init_provider(self) -> LLMProvider:
        if self.provider_name == "groq" and settings.GROQ_API_KEY:
            return GroqProvider(settings.GROQ_API_KEY)
        elif self.provider_name == "openai" and settings.OPENAI_API_KEY:
            return OpenAICompatibleProvider(settings.OPENAI_API_KEY)
        return FallbackProvider()

    def generate_explanation(self, failure_code: str, recovery_prob: float, recommended_action: str, amount: float) -> str:
        prompt = f"""
        [PROMPT VERSION: {self.prompt_version}]
        You are RevPilot AI. Explain the recovery decision for a payment failure:
        Failure Code: {failure_code}
        Recovery Probability: {recovery_prob}
        Recommended Action: {recommended_action}
        Amount: ₹{amount}
        Keep the explanation brief (1-2 sentences) and professional.
        """
        
        context_hash = hashlib.sha256(prompt.encode()).hexdigest()
        cache_key = f"llm:{self.provider_name}:{self.prompt_version}:{context_hash}"
        
        # 1. Try Cache
        if redis_available:
            try:
                cached_res = redis_client.get(cache_key)
                if cached_res:
                    return cached_res.decode('utf-8')
            except Exception as e:
                print(f"LLM Cache read failed: {e}")
        elif cache_key in redis_client:
            return redis_client[cache_key]

        # 2. Call Provider or Fallback
        explanation = ""
        try:
            explanation = self.provider.generate(prompt)
        except Exception as e:
            print(f"LLM Provider execution failed: {e}. Utilizing fallback rule generator.")

        if not explanation:
            if failure_code == 'TRANSIENT_FAILURE':
                explanation = f"Payment failed due to a temporary network timeout. ML predicts a {int(recovery_prob*100)}% recovery chance with immediate retry."
            elif failure_code == 'INSUFFICIENT_FUNDS':
                explanation = "Customer has insufficient funds. ML recommends delaying retry by 120 minutes to allow balance replenishment."
            elif failure_code == 'EXPIRED_CARD':
                explanation = "Card instrument is expired. System recommends sending a payment method update request to the customer."
            elif failure_code == 'FRAUD_SUSPECTED':
                explanation = "High risk marker detected by security engine. Immediate stop recovery intervention selected to prevent chargebacks."
            else:
                explanation = f"Standard recovery intervention ({recommended_action}) selected for transaction value ₹{amount} based on historical retry outcomes."

        # 3. Save to Cache
        if redis_available:
            try:
                redis_client.setex(cache_key, 3600, explanation)
            except Exception as e:
                print(f"LLM Cache write failed: {e}")
        else:
            redis_client[cache_key] = explanation

        return explanation

llm_service = LLMService()
