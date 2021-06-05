import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as random from "@pulumi/random";

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

const password = new random.RandomPassword("wppassword", {
    length: 16,
    special: false
});

const namespace = new k8s.core.v1.Namespace("lab12-ns", {
    metadata: {
        name: "lab12"
    }
}, opts);

const wordpress = password.result.apply(pw => new k8s.helm.v3.Chart("wp", {
    version: "11.0.9",
    namespace: namespace.metadata.name,
    chart: "wordpress",
    fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
    },
    values: {
        wordpressUsername: "rooty",
        wordpressPassword: pw
    }
}, opts));

const frontend = wordpress.apply(x => x.getResourceProperty("v1/Service", "lab12", "wp-wordpress", "status"));
const ingress = frontend.loadBalancer.ingress[0];

export const frontendIp = ingress.apply(x => x.ip);
export const wpUser = "rooty";
export const wpPassword = pulumi.secret(password.result);