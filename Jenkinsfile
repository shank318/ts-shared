pipeline {
    agent { label 'swarm' }

    stages {
        stage('Tests') {
            steps {
                ansiColor('xterm') {
                    sh 'docker-compose run --rm tests'
                }
            }
        }
    }

    post {
        always {
            sh 'docker-compose down -v --rmi local'
        }
    }
}
