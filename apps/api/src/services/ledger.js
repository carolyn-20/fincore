import { pool } from '../db/pool.js';
import { HttpError } from '../lib/errors.js';
// All transfer state + ledger postings commit or roll back together.
export async function postTransfer({fromWalletId,toWalletId,amount,idempotencyKey,description}) {
 const client=await pool.connect();
 try {
  await client.query('BEGIN');
  const prior=await client.query('SELECT * FROM transfers WHERE idempotency_key=$1',[idempotencyKey]);
  if(prior.rowCount){await client.query('COMMIT');return prior.rows[0];}
  const ids=[fromWalletId,toWalletId].sort();
  const locked=await client.query('SELECT id,user_id,currency,status FROM wallets WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE',[ids]);
  const retry=await client.query('SELECT * FROM transfers WHERE idempotency_key=$1',[idempotencyKey]);
  if(retry.rowCount){await client.query('COMMIT');return retry.rows[0];}
  if(locked.rowCount!==2) throw new HttpError(404,'Wallet not found');
  const from=locked.rows.find(w=>w.id===fromWalletId), to=locked.rows.find(w=>w.id===toWalletId);
  if(from.status!=='active'||to.status!=='active') throw new HttpError(409,'Wallet is not active');
  if(from.currency!==to.currency) throw new HttpError(400,'Wallet currencies must match');
  const balance=await client.query(`SELECT COALESCE(SUM(CASE WHEN entry_type='credit' THEN amount ELSE -amount END),0) AS balance FROM ledger_entries WHERE wallet_id=$1`,[fromWalletId]);
  if(Number(balance.rows[0].balance)<Number(amount)) throw new HttpError(409,'Insufficient funds');
  const t=await client.query("INSERT INTO transfers(from_wallet_id,to_wallet_id,amount,currency,status,idempotency_key,description) VALUES($1,$2,$3,$4,'posted',$5,$6) RETURNING *",[fromWalletId,toWalletId,amount,from.currency,idempotencyKey,description||'Wallet transfer']);
  await client.query("INSERT INTO ledger_entries(transfer_id,wallet_id,entry_type,amount,currency) VALUES($1,$2,'debit',$3,$4),($1,$5,'credit',$3,$4)",[t.rows[0].id,fromWalletId,amount,from.currency,toWalletId]);
  const sums=await client.query("SELECT COALESCE(SUM(CASE WHEN entry_type='debit' THEN amount ELSE -amount END),0) AS delta FROM ledger_entries WHERE transfer_id=$1",[t.rows[0].id]);
  if(Number(sums.rows[0].delta)!==0) throw new Error('Ledger invariant violated');
  await client.query('COMMIT'); return t.rows[0];
 } catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}
export async function walletBalance(walletId){const r=await pool.query("SELECT COALESCE(SUM(CASE WHEN entry_type='credit' THEN amount ELSE -amount END),0)::text AS balance FROM ledger_entries WHERE wallet_id=$1",[walletId]);return r.rows[0].balance;}
