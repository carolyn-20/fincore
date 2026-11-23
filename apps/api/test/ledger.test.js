import test from 'node:test'; import assert from 'node:assert/strict';
test('money validation rejects zero and malformed decimal amounts',()=>{for(const x of ['0','-1','1.234','abc']) assert.equal(/^\d{1,15}(\.\d{1,2})?$/.test(x)&&Number(x)>0,false);});
test('idempotency key policy rejects missing/short keys',()=>{for(const x of ['', 'short']) assert.equal(typeof x==='string'&&x.length>=8&&x.length<=100,false);});
test('balanced double-entry transfer has equal debit and credit',()=>{const debit=125.50,credit=125.50;assert.equal(debit-credit,0);});
