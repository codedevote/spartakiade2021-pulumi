import * as pulumi from "@pulumi/pulumi";
import { ResourceGroup } from "@pulumi/azure-native/resources";
import { ManagedCluster, OSType, AgentPoolType, AgentPoolMode, ResourceIdentityType, listManagedClusterUserCredentials } from "@pulumi/azure-native/containerservice";
import { VirtualMachineSizeTypes } from "@pulumi/azure-native/compute";
import { PrivateKey } from "@pulumi/tls";

// config:
//   Lab7-Snapshot:kubernetesVersion: 1.19.9
//   Lab7-Snapshot:replicaCount: "1"
//   azure-native:location: WestEurope

const stackName = pulumi.getStack();
const config = new pulumi.Config();
const replicaCount = config.requireNumber("replicaCount");
const version = config.require("kubernetesVersion");

// Create an Azure Resource Group
const resourceGroup = new ResourceGroup("lab7");

const sshPublicKey = new PrivateKey("ssh-key", {
    algorithm: "RSA",
    rsaBits: 4096
}).publicKeyOpenssh;

const managedCluster = new ManagedCluster("managedCluster", {
    agentPoolProfiles: [{
        count: replicaCount,
        name: "nodepool",
        osType: OSType.Linux,
        type: AgentPoolType.VirtualMachineScaleSets, 
        vmSize: VirtualMachineSizeTypes.Standard_D2s_v3,
        mode: AgentPoolMode.System,
    }],
    kubernetesVersion: version,
    // linuxProfile: {
    //     adminUsername: "admin",
    //     ssh: {
    //         publicKeys: [{
    //             keyData: sshPublicKey,
    //         }],
    //     },
    // },
    dnsPrefix: stackName,
    resourceGroupName: resourceGroup.name,
    resourceName: "akscluster",
    identity: {
        type: ResourceIdentityType.SystemAssigned
    }
});


// get kubeconfig of created cluster
const creds = pulumi.all([managedCluster.name, resourceGroup.name]).apply(([clusterName, rgName]) => {
    return listManagedClusterUserCredentials({
        resourceGroupName: rgName,
        resourceName: clusterName,
    });
});

const encoded = creds.kubeconfigs[0].value;

export const kubeConfig = pulumi.secret(encoded.apply(enc => Buffer.from(enc, "base64").toString()));