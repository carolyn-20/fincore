from decimal import Decimal
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List
app=FastAPI(title="FinCore Risk Analytics",version="1.0.0",description="Synthetic-data decision support; scores are not proof of fraud.")
class Transaction(BaseModel):
    transaction_id:str
    customer_id:str
    amount:Decimal=Field(gt=0, max_digits=20, decimal_places=2)
    currency:str=Field(default="INR", min_length=3, max_length=3)
    transactions_last_hour:int=Field(default=1,ge=1)
    is_new_beneficiary:bool=False
class RiskResult(BaseModel):
    transaction_id:str
    risk_score:Decimal
    flags:List[str]
    disclaimer:str="Decision support only; a risk flag is not proof of fraud. Synthetic assessment data only."
@app.get("/health")
def health(): return {"status":"ok","service":"risk-analytics","data":"synthetic"}
@app.post("/v1/risk/score",response_model=RiskResult)
def score(tx:Transaction):
    flags=[]; score=Decimal("0")
    if tx.amount>=Decimal("50000"): flags.append("high_value"); score+=Decimal("35")
    if tx.transactions_last_hour>=5: flags.append("high_velocity"); score+=Decimal("30")
    if tx.is_new_beneficiary: flags.append("new_beneficiary"); score+=Decimal("15")
    score=min(score,Decimal("100"))
    return RiskResult(transaction_id=tx.transaction_id,risk_score=score,flags=flags)

class FeeRequest(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=20, decimal_places=2)
    rate_percent: Decimal = Field(ge=0, le=100, max_digits=6, decimal_places=3)
    fixed_fee: Decimal = Field(default=Decimal("0.00"), ge=0, max_digits=10, decimal_places=2)

@app.post("/v1/calculations/fee")
def calculate_fee(body: FeeRequest):
    raw = body.amount * body.rate_percent / Decimal("100") + body.fixed_fee
    fee = raw.quantize(Decimal("0.01"))
    return {"amount": str(body.amount), "fee": str(fee), "total": str(body.amount + fee), "rounding": "ROUND_HALF_EVEN", "currency": "INR"}

class ReconciliationItem(BaseModel):
    expected: Decimal = Field(ge=0, max_digits=20, decimal_places=2)
    observed: Decimal = Field(ge=0, max_digits=20, decimal_places=2)

@app.post("/v1/calculations/reconcile")
def reconcile(body: ReconciliationItem):
    difference = (body.expected - body.observed).quantize(Decimal("0.01"))
    return {"expected": str(body.expected), "observed": str(body.observed), "difference": str(difference), "matched": difference == Decimal("0.00")}
