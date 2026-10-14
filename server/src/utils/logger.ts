import winston from 'winston';
import net from 'net';


//  Récupère l'hôte de Logstash (par exemple 'host.docker.internal' dans Docker, ou 'localhost' sur le Mac)
const LOGSTASH_HOST = process.env.LOGSTASH_HOST || 'localhost';
const LOGSTASH_PORT = Number(process.env.LOGSTASH_PORT) || 5044;
// Transport personnalisé vers Logstash en TCP
const sendToLogstash = (logObject: object) => {
  const client = new net.Socket();
  client.connect(LOGSTASH_PORT, LOGSTASH_HOST, () => {
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
