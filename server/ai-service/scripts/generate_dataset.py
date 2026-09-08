import os
# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd

def generate_synthetic_data(num_samples=50000, seed=42):
    np.random.seed(seed)
    print(f"Generating {num_samples} synthetic payment failure records...")

    payment_methods = ['credit_card', 'debit_card', 'upi', 'net_banking']
    failure_codes = ['TRANSIENT_FAILURE', 'INSUFFICIENT_FUNDS', 'EXPIRED_CARD', 'INVALID_REQUEST', 'FRAUD_SUSPECTED']
    customer_segments = ['STANDARD', 'VIP', 'ENTERPRISE']

    amounts = np.random.exponential(scale=3500, size=num_samples) + 200
    amounts = np.round(np.clip(amounts, 100, 100000), 2)

    payment_method_indices = np.random.choice(len(payment_methods), size=num_samples, p=[0.4, 0.3, 0.2, 0.1])
    p_methods = [payment_methods[i] for i in payment_method_indices]

    failure_code_indices = np.random.choice(len(failure_codes), size=num_samples, p=[0.35, 0.40, 0.15, 0.07, 0.03])
    f_codes = [failure_codes[i] for i in failure_code_indices]

    segment_indices = np.random.choice(len(customer_segments), size=num_samples, p=[0.7, 0.2, 0.1])
    c_segments = [customer_segments[i] for i in segment_indices]

    attempt_numbers = np.random.choice([1, 2, 3, 4], size=num_samples, p=[0.6, 0.25, 0.1, 0.05])
    prev_successful = np.random.poisson(lam=12, size=num_samples)
    prev_failed = np.random.poisson(lam=1.5, size=num_samples)
    
    customer_ltv = prev_successful * np.random.uniform(500, 2000, size=num_samples) + amounts
    customer_tenure = np.random.randint(1, 60, size=num_samples)
    subscription_age = np.random.randint(1, 365, size=num_samples)
    days_since_prev = np.random.randint(1, 45, size=num_samples)
    hour_of_day = np.random.randint(0, 24, size=num_samples)
    day_of_week = np.random.randint(0, 7, size=num_samples)

    log_odds_arr = np.full(num_samples, -0.5)

    # Failure code effects
    for i in range(num_samples):
        fc = f_codes[i]
        if fc == 'TRANSIENT_FAILURE':
            log_odds_arr[i] += 2.2
        elif fc == 'INSUFFICIENT_FUNDS':
            log_odds_arr[i] -= 0.5
        elif fc == 'EXPIRED_CARD':
            log_odds_arr[i] += 1.1
        elif fc == 'INVALID_REQUEST':
            log_odds_arr[i] -= 1.5
        elif fc == 'FRAUD_SUSPECTED':
            log_odds_arr[i] -= 3.5
        
        # Segment effect
        if c_segments[i] == 'VIP':
            log_odds_arr[i] += 0.8
        elif c_segments[i] == 'ENTERPRISE':
            log_odds_arr[i] += 1.2
            
        # Attempt count penalty
        log_odds_arr[i] -= (attempt_numbers[i] - 1) * 0.7
        
        # Previous success boost
        if prev_successful[i] > 10:
            log_odds_arr[i] += 0.5
            
    # Add noise
    log_odds_arr += np.random.normal(0, 0.5, size=num_samples)
    
    probabilities = 1 / (1 + np.exp(-log_odds_arr))
    target_recovered = (np.random.uniform(0, 1, size=num_samples) < probabilities).astype(int)
    
    # Calculate Risk Score (0.0 to 1.0)
    risk_score = 1.0 - probabilities + np.random.normal(0, 0.05, size=num_samples)
    risk_score = np.clip(risk_score, 0.0, 1.0)

    df = pd.DataFrame({
        'amount': amounts,
        'payment_method': p_methods,
        'failure_code': f_codes,
        'attempt_number': attempt_numbers,
        'prev_successful_payments': prev_successful,
        'prev_failed_payments': prev_failed,
        'customer_ltv': np.round(customer_ltv, 2),
        'customer_tenure_months': customer_tenure,
        'subscription_age_days': subscription_age,
        'days_since_prev_payment': days_since_prev,
        'hour_of_day': hour_of_day,
        'day_of_week': day_of_week,
        'customer_segment': c_segments,
        'risk_score': np.round(risk_score, 4),
        'target_recovered': target_recovered
    })

    os.makedirs('server/ai-service/datasets', exist_ok=True)
    out_path = 'server/ai-service/datasets/synthetic_recovery_data.csv'
    df.to_csv(out_path, index=False)
    print(f"Dataset saved to {out_path}. Recovery Rate: {df['target_recovered'].mean():.2%}")
    return df

if __name__ == '__main__':
    generate_synthetic_data()
