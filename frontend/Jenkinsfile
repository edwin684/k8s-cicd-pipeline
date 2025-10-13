pipeline {
    agent any

    environment {
        // Jenkins credentials (create these in Jenkins -> Credentials -> Global)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')   // DockerHub username + password
        GIT_CRED              = credentials('GIT_CRED')          // GitHub PAT (username: edwin684, password: PAT)
        KUBECONFIG_CRED       = credentials('kubeconfig-file')   // Secret file: ~/.kube/config

        DOCKERHUB_USER = 'edwin684'
        IMAGE_NAME     = 'edwin684/k8s-cicd-pipeline'
        IMAGE_TAG      = "${env.BUILD_NUMBER ?: 'latest'}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📦 Checking out source code from GitHub..."
                script {
                    sh """
                        git clone https://${GIT_CRED_USR}:${GIT_CRED_PSW}@github.com/edwin684/k8s-cicd-pipeline.git app
                        cd app
                        git checkout main
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "🐳 Building Docker image..."
                    sh """
                        cd app
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    """
                }
            }
        }

        stage('Login & Push to DockerHub') {
            steps {
                script {
                    echo "🚀 Logging in to DockerHub and pushing image..."
                    sh """
                        echo "${DOCKERHUB_CREDENTIALS_PSW}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
                        docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to Kubernetes (EKS)') {
            steps {
                script {
                    echo "☸️ Deploying to Kubernetes cluster..."
                    writeFile file: 'kubeconfig', text: KUBECONFIG_CRED
                    sh '''
                        export KUBECONFIG=kubeconfig
                        kubectl set image deployment/frontend frontend=${IMAGE_NAME}:${IMAGE_TAG} --record || true
                        kubectl set image deployment/backend backend=${IMAGE_NAME}:${IMAGE_TAG} --record || true
                        kubectl rollout status deployment/frontend || true
                        kubectl rollout status deployment/backend || true
                    '''
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo "🧹 Cleaning up local Docker images..."
                sh 'docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true'
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful! Image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ Build or deploy failed. Check logs above."
        }
    }
}
