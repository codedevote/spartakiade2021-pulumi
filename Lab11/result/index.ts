import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { QuickService } from "./quickService";

const projectName = pulumi.getProject();
var stackName = pulumi.getStack();

var lab7Ref = new pulumi.StackReference("lab7reference", {
    name: `codedevote/Lab7-Snapshot/${stackName}`
});

var kubeConfig = lab7Ref.requireOutput("kubeConfig");

// create provider for further usage (TLDR: defines k8s cluster where to deploy to for upcoming k8s resource definitions)
const k8sProvider = new k8s.Provider("aksprovider", {
    kubeconfig: kubeConfig
});

const opts: pulumi.CustomResourceOptions = {
    provider: k8sProvider
};

const namespace = new k8s.core.v1.Namespace("lab11-ns", {
    metadata: {
        name: "lab11"
    }
}, opts);

const appLabels = { 
    app: projectName, 
    env: stackName 
};

const echoServer = new QuickService("echoserver", {
    image: "ealen/echo-server",
    labels: appLabels,
    name: "echoserver",
    namespace: namespace.metadata.name,
    port: 80,
    targetPort: 80, 
    replicaCount: 1
}, opts);


export const echoServerIp = echoServer.serviceIp;