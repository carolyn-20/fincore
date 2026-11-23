from fastapi.testclient import TestClient
from app.main import app
client=TestClient(app)
def test_health(): assert client.get('/health').json()['status']=='ok'
def test_high_velocity_flag():
 r=client.post('/v1/risk/score',json={'transaction_id':'t1','customer_id':'c1','amount':'100.00','transactions_last_hour':6})
 assert r.status_code==200 and 'high_velocity' in r.json()['flags']
def test_reject_negative_amount():
 assert client.post('/v1/risk/score',json={'transaction_id':'t1','customer_id':'c1','amount':'-1'}).status_code==422


def test_decimal_fee_calculation():
 r=client.post('/v1/calculations/fee',json={'amount':'100.00','rate_percent':'2.5','fixed_fee':'1.00'})
 assert r.status_code==200 and r.json()['fee']=='3.50'

def test_reconciliation_difference():
 r=client.post('/v1/calculations/reconcile',json={'expected':'100.00','observed':'99.50'})
 assert r.status_code==200 and r.json()['difference']=='0.50' and not r.json()['matched']
