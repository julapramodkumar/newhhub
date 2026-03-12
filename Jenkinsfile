pipeline {
    agent any

    stages {

        stage('Clone Repo') {
            steps {
                git 'https://github.com/julapramodkumar/newhhub.git'
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
