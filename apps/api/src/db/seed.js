import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
const client = await pool.connect();
try {
 await client.query('BEGIN');
 const hash = await bcrypt.hash('DemoPass123!', 12);
 for (const u of [{email:'customer@fincore.test',name:'Carolyn Demo',role:'customer'},{email:'ops@fincore.test',name:'Operations Demo',role:'operations_analyst'}]) {
  const r=await client.query('INSERT INTO users(email,full_name,password_hash,role) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id',[u.email,u.name,hash,u.role]);
  const w=await client.query("INSERT INTO wallets(user_id,currency) VALUES($1,'INR') ON CONFLICT(user_id,currency) DO UPDATE SET currency=EXCLUDED.currency RETURNING id",[r.rows[0].id]);
  const existing=await client.query('SELECT 1 FROM ledger_entries WHERE wallet_id=$1 LIMIT 1',[w.rows[0].id]);
  if(!existing.rowCount){const opening=u.role==='customer'?'5000.00':'2000.00';await client.query("INSERT INTO ledger_entries(wallet_id,entry_type,amount,currency) VALUES($1,'credit',$2,'INR')",[w.rows[0].id,opening]);}
 }
 await client.query('COMMIT'); console.log('Seeded demo users. Password: DemoPass123!');
} catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();await pool.end();}
