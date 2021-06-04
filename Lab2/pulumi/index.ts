import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

const image = new docker.RemoteImage("nginx", {
    name: "nginx"
});

const container = new docker.Container("nginx", {
    image: image.latest
});

export const containerName = container.name;