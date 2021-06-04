import * as azure from "@pulumi/azure-native";
import * as policy from "@pulumi/policy";

new policy.PolicyPack("azure-typescript", {
    policies: [
        noPublicIp("mandatory")
    ],
});


function noPublicIp(enforcementLevel: policy.EnforcementLevel) : policy.ResourceValidationPolicy {
    return {
        name: "container-group-no-public-ip",
        description: "Prohibits setting a public ip for ACI container groups.",
        enforcementLevel: enforcementLevel,
        validateResource: policy.validateResourceOfType(azure.containerinstance.ContainerGroup, (group, args, reportViolation) => {
            if (group.ipAddress?.type === azure.containerinstance.ContainerGroupIpAddressType.Public) {
                reportViolation("Azure container group must NOT have public ip address type.");
            }
        }),
    };
}