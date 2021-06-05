import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

const stackName = pulumi.getStack();

const resourceGroup = new azure.resources.ResourceGroup(`${stackName}-lab5`);

const containerGroup = new azure.containerinstance.ContainerGroup("containerGroup", {
    containerGroupName: "echo-server",
    containers: [{
        command: [],
        environmentVariables: [],
        image: "ealen/echo-server",
        name: "echo-server",
        ports: [{
            port: 80, 
        }],
        resources: {
            requests: {
                cpu: 1,
                memoryInGB: 1.5,
            },
        },
    }],
    ipAddress: {
        type: azure.containerinstance.ContainerGroupIpAddressType.Public, 
        ports: [
            {
                port: 80, 
                protocol: azure.containerinstance.ContainerGroupNetworkProtocol.TCP,
            }
        ]
    },
    osType: azure.containerinstance.OperatingSystemTypes.Linux,
    resourceGroupName: resourceGroup.name
});

const containerGroupInfo = pulumi.all([containerGroup.name, resourceGroup.name]).apply(([cgn, rgn]) => 
    azure.containerinstance.getContainerGroup({
        containerGroupName: cgn, 
        resourceGroupName: rgn
    }
));

export const containerPublicIp = containerGroupInfo.ipAddress?.apply(x => x?.ip);
