pipeline {
    agent any

    environment {
        // Configuración común
        NODE_ENV = 'production'
        EC2_USER = 'ubuntu'
        SSH_KEY = credentials('ssh-key-ec2')
        
        // Configuración por entorno (se sobrescriben según la rama)
        EC2_IP = ''
        REMOTE_PATH = ''
        APP_NAME = 'health-api'
    }

    stages {
        stage('Setup Environment') {
            steps {
                script {
                    // Determina configuración según la rama
                    switch(env.BRANCH_NAME) {
                        case 'dev':
                            env.EC2_IP = '3.220.122.151' // IP elástica DEV
                            env.REMOTE_PATH = '/home/ubuntu/Jenkins--prueba-dev'
                            env.APP_NAME = 'health-api-dev'
                            break
                        case 'qa':
                            env.EC2_IP = '3.220.122.152' // IP elástica QA
                            env.REMOTE_PATH = '/home/ubuntu/Jenkins--prueba-qa'
                            env.APP_NAME = 'health-api-qa'
                            break
                        case 'main':
                            env.EC2_IP = '3.220.122.153' // IP elástica PROD
                            env.REMOTE_PATH = '/home/ubuntu/Jenkins--prueba-prod'
                            env.APP_NAME = 'health-api-prod'
                            break
                        default:
                            error("Rama no soportada para deploy: ${env.BRANCH_NAME}")
                    }
                    
                    echo " Configurando deploy en ${env.BRANCH_NAME.toUpperCase()}"
                    echo "  Servidor: ${env.EC2_IP}"
                    echo " Ruta: ${env.REMOTE_PATH}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', 
                         branches: [[name: env.BRANCH_NAME]], 
                         userRemoteConfigs: [[url: 'https://github.com/Th3Danny/Jenkins--prueba.git']]])
            }
        }

        stage('Build') {
            steps {
                sh 'rm -rf node_modules || true'
                sh 'npm ci'
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'dev'
                    branch 'qa'
                    branch 'main'
                }
            }
            steps {
                script {
                    // Validación adicional para producción
                    if (env.BRANCH_NAME == 'main') {
                        input message: "¿Confirmas despliegue en PRODUCCIÓN?", ok: "Desplegar"
                    }
                    
                    sshagent([SSH_KEY]) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} "
                                set -e # Detener en caso de error
                                cd ${REMOTE_PATH}
                                git fetch --all
                                git reset --hard origin/${BRANCH_NAME}
                                npm ci --omit=dev
                                pm2 delete ${APP_NAME} || true
                                pm2 start server.js --name ${APP_NAME}
                                pm2 save
                            "
                        """
                    }
                    
                    echo "Despliegue en ${BRANCH_NAME.toUpperCase()} completado"
                }
            }
        }
    }

    post {
        failure {
            echo " Pipeline fallido en la etapa: ${currentBuild.result}"
            // slackSend channel: '#alertas', message: "Falló deploy de ${BRANCH_NAME}"
        }
        success {
            echo "🎉 Pipeline ejecutado correctamente"
        }
    }
}