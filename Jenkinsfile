pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        GIT_CRED = credentials('GIT_CRED')
        KUBECONFIG_CRED = credentials('kubeconfig-file')
        DOCKERHUB_USER = 'edwin305'
        IMAGE_NAME = 'edwin305/k8s-cicd-pipeline'
        IMAGE_TAG = "${env.BUILD_NUMBER ?: 'latest'}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/edwin684/k8s-cicd-pipeline.git',
                        credentialsId: 'GIT_CRED'
                    ]]
                ])
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}-frontend:${IMAGE_TAG} ./frontend'
                sh 'docker build -t ${IMAGE_NAME}-backend:${IMAGE_TAG} ./backend'
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                  echo "${DOCKERHUB_CREDENTIALS_PSW}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
                  docker push ${IMAGE_NAME}-frontend:${IMAGE_TAG}
                  docker push ${IMAGE_NAME}-backend:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                writeFile file: 'kubeconfig', text: KUBECONFIG_CRED
                sh '''
                  export KUBECONFIG=kubeconfig
                  kubectl set image deployment/frontend frontend=${IMAGE_NAME}-frontend:${IMAGE_TAG} --record || true
                  kubectl set image deployment/backend backend=${IMAGE_NAME}-backend:${IMAGE_TAG} --record || true
                  kubectl rollout status deployment/frontend || true
                  kubectl rollout status deployment/backend || true
                '''
            }
        }
    }

    post {
        success { echo "✅ Deployment successful! Build: ${IMAGE_TAG}" }
        failure { echo "❌ Pipeline failed!" }
    }
}
