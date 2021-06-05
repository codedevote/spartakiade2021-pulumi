import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

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

const namespace = new k8s.core.v1.Namespace("lab8-ns", {
    metadata: {
        name: "lab8"
    }
}, opts);

const pod = new k8s.core.v1.Pod("firstpod", {
    metadata: {
        name: "firstpod",
        namespace: namespace.metadata.name
    },
    spec: {
        containers: [{
            name: "nginx",
            image: "nginx"
        }]
    }
}, opts);

