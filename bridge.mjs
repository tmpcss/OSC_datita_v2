import { WebSocketServer } from 'ws';
import { Client } from 'node-osc';

const WS_PORT = 8080;
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`-------------------------------------------`);
console.log(`🚀 OSC BRIDGE RUNNING ON WS PORT ${WS_PORT}`);
console.log(`Relaying WebSocket JSON to OSC UDP`);
console.log(`-------------------------------------------`);

// Cache clients to avoid constant recreation
const clients = new Map();

function getClient(host, port) {
  const key = `${host}:${port}`;
  if (!clients.has(key)) {
    clients.set(key, new Client(host, port));
  }
  return clients.get(key);
}

wss.on('connection', (ws) => {
  console.log('✅ Web App connected to bridge');

  ws.on('message', (rawData) => {
    try {
      const data = JSON.parse(rawData);
      const { host, port, address, args } = data;

      if (!host || !port || !address) {
        console.warn('⚠️ Missing required fields in message:', data);
        return;
      }

      const client = getClient(host, port);
      
      console.log(`📡 [OSC] ${host}:${port} -> ${address} (${args.join(', ')})`);
      
      client.send(address, ...args, (err) => {
        if (err) {
          console.error(`❌ Error sending OSC to ${host}:${port}:`, err);
        }
      });
    } catch (e) {
      console.error('❌ Error processing message:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('ℹ️ Web App disconnected');
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket Error:', err);
  });
});

process.on('SIGINT', () => {
  console.log('\nStopping bridge...');
  clients.forEach(c => c.kill());
  wss.close();
  process.exit();
});
