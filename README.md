# TO KNOW

1. ECS service (refers to main.tf) is created here for better illustration for the use case.
2. Some resources are meant to create in sequence, so expected to have some errors complaining resource is not created if your run terraform plan from the top.

The sequence to run is based on folder structure is:
    - vpc
    - kms
    - alpha/beta

3. All the requirements stated are illustrated in the modules, will further explain during presentation
4. VPC creation is tested using terraform plan to make sure no error, all the values and cidr blocks used is for demo

