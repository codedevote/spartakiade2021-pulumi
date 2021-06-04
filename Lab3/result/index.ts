import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { enums } from "@pulumi/azure-native/types";

const stackName = pulumi.getStack();
const projectName = pulumi.getProject();

const resourceGroup = new azure.resources.ResourceGroup(`${stackName}-${projectName}`);

const storageAccount = new azure.storage.StorageAccount("storage", {
    kind: azure.storage.Kind.StorageV2,
    resourceGroupName: resourceGroup.name,
    sku:{
        name: azure.storage.SkuName.Standard_LRS
    }, 
    allowBlobPublicAccess: true
});

const container = new azure.storage.BlobContainer("images", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    publicAccess: enums.storage.PublicAccess.Container,
    containerName: pulumi.interpolate `${storageAccount.name}-images`
});

const imageBlob = new azure.storage.Blob("pulumipus", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    containerName: container.name,
    type: azure.storage.BlobType.Block,
    blobName: "pulumipus.svg",
    contentType: "image/svg+xml",
    source: new pulumi.asset.FileAsset("pulumipus.svg")
});

const websiteIndex = new azure.storage.Blob("indexhtml", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    containerName: container.name,
    type: azure.storage.BlobType.Block,
    blobName: "index.html",
    contentType: "text/html",
    source: new pulumi.asset.FileAsset("index.html")
});

const staticWebsite = new azure.storage.StorageAccountStaticWebsite("staticWebsite", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    indexDocument: "index.html"
});

const staticWebsiteIndex = new azure.storage.Blob("staticindexhtml", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    containerName: staticWebsite.containerName,
    type: azure.storage.BlobType.Block,
    blobName: "index.html",
    contentType: "text/html",
    source: new pulumi.asset.FileAsset("index.html")
});


export const imageUrl = imageBlob.url;
export const websiteUrl = websiteIndex.url;
export const staticWebsiteUrl = staticWebsiteIndex.url;