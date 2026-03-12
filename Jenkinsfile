pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/julapramodkumar/newhhub.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Node App') {
            steps {
                sh 'node createSuperAdmin.js'
            }
        }

    }
}
