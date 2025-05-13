pipeline {
    agent any

    tools {
        nodejs "NodeJS-22"  // Requiere configuración previa en Jenkins
    }

    environment {
        NODE_ENV = 'production'
        EC2_USER = 'ubuntu'
        EC2_IP = '54.242.9.234'
        REMOTE_PATH = '/home/ubuntu/Jenkins--prueba'
        SSH_KEY = credentials('ssh-key-ec2')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Th3Danny/Jenkins--prueba.git'
            }
        }

        stage('Build') {
            steps {
                sh 'rm -rf node_modules || true'
                sh 'npm ci'
            }
        }

        stage('Prepare Deployment') {
            steps {
                sh """
                # Copiar archivos al servidor remoto
                rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
                    --exclude='node_modules' \
                    --exclude='.git' \
                    ./ $EC2_USER@$EC2_IP:$REMOTE_PATH/
                """
            }
        }

        stage('Deploy') {
            steps {
                sh """
                ssh -i $SSH_KEY -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP '
                    set -e  # Detener en caso de error
                    cd $REMOTE_PATH
                    npm install --production
                    # Instalar PM2 globalmente si no existe
                    if ! command -v pm2 &> /dev/null; then
                        sudo npm install -g pm2
                    fi
                    # Reiniciar o iniciar la aplicación
                    pm2 delete health-api || true
                    pm2 start server.js --name health-api
                    pm2 save
                    pm2 startup 2>&1 | grep "sudo" | bash
                '
                """
            }
        }
    }

    post {
        always {
            cleanWs()  // Limpiar workspace después del build
        }
    }
}