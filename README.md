# Natter

The aim of this project is to learn and implement a number of DevOps tools, practices and workflows in different stages:

1. Setup a local development environment with Docker, using docker-compose to maintain the environment. Write the
   simplest API, frontend and database to deliver a single message from the index route.
2. Deploy the app to AWS, manually configuring the ALB, VPC, SubNets and Routing Table.
3. Add CI pipeline to auto build and test with GitHub Actions.
4. Using terraform to deploy AWS infrastructure.
4. Develop an Express API and React frontend through TDD using Jest, puppeteer and supertest.

#### Technologies

* Docker
* AWS Services
* Jest
* GitHub Actions
* Terraform

#### Live link

N/A

## Status

Stage 3

Beginning to setup Actions workflow to build docker-compose and run tests.

Stage 4

Building out the terraform configuration. Currently, the backend is up and working on a Fargate ECS instance 👍. I'm now
working on provisioning the front end with Cloudfront S3. The next step will be to use Route 53 to serve the app with
the correct domains.

## Reflection

Setting up a production environment in AWS has given me a much greater understanding of how an iterative development
process would function and how rolling updates or blue / green update patterns are implemented. I appreciate now the
measures taken to maintain service and maximise availability and security in mature applications. I'm excited to get a
CI/CD pipeline setup now and see it in action.

## Skills Gained

    * Docker
    * TDD
    * CI/CD iterative development pattern
    * AWS Services
