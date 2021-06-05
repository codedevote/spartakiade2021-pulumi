import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

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

const namespace = new k8s.core.v1.Namespace("lab10-ns", {
    metadata: {
        name: "lab10"
    }
}, opts);

const appLabels = { 
    app: projectName, 
    env: stackName 
};

const deployment = new k8s.apps.v1.Deployment("echoserver", {
    metadata: {
        namespace: namespace.metadata.name
    },
    spec: {
        selector: { 
            matchLabels: appLabels 
        },
        replicas: 1,
        template: {
            metadata: { 
                labels: appLabels 
            },
            spec: { 
                containers: [{ 
                    name: "echoserver",
                    image: "ealen/echo-server" 
                }] 
            }
        }
    }
}, opts);

const service = new k8s.core.v1.Service("echoserver", {
    metadata: {
        namespace: namespace.metadata.name
    },
    spec: {
        selector: appLabels,
        ports: [{
            port: 80,
            targetPort: 80,
            protocol: "TCP"
        }],
        type: k8s.core.v1.ServiceSpecType.LoadBalancer
    }
}, opts);

export const echoServerIp = service.status.loadBalancer.ingress[0].ip;