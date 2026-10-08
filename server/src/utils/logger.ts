import winston from 'winston';
import net from 'net';

// Transport personnalisé vers Logstash en TCP
const sendToLogstash = (logObject: object) => {
  const client = new net.Socket();
  client.connect(5044, 'localhost', () => {
    client.write(JSON.stringify(logObject) + '\n');
    client.end();
  });
  client.on('error', () => {
    // Ignore les erreurs si Logstash n'est pas démarré
  });
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'orion-backend' },
  transports: [
    new winston.transports.Console()
  ]
});

// On intercepte chaque log Winston pour l'envoyer aussi à Logstash
logger.on('data', (chunk) => {
  sendToLogstash(chunk);
});

export default logger;
