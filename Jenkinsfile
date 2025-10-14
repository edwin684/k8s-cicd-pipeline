pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')  
        KUBECONFIG_CRED       = credentials('kubeconfig-file')  

        DOCKERHUB_USER = 'edwin684'
        IMAGE_NAME     = 'edwin684/k8s-cicd-pipeline'
        IMAGE_TAG      = "${env.BUILD_NUMBER ?: 'latest'}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📦 Checking out source code from GitHub..."
                sh 'ls -l' // optional: list files
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image..."
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Login & Push to DockerHub') {
            steps {
                echo "🚀 Logging in to DockerHub and pushing image..."
                sh """
                    echo "${DOCKERHUB_CREDENTIALS_PSW}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to Kubernetes (EKS)') {
            steps {
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

        stage('Cleanup') {
            steps {
                echo "🧹 Cleaning up local Docker images..."
                sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true"
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
