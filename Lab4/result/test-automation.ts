import { LocalProgramArgs, LocalWorkspace, OutputMap } from "@pulumi/pulumi/automation";
import * as crypto from "crypto";
import * as upath from "upath";

const randomString = crypto.randomBytes(8).toString('hex');

const args: LocalProgramArgs = {
    stackName: `integration-tests-${randomString}`,
    workDir: upath.joinSafe(__dirname, "..", "..", "Lab3", "result"),
};

export async function deploy(): Promise<OutputMap> {
    
    const stack = await LocalWorkspace.createOrSelectStack(args);

    await stack.setConfig("azure-native:location", { value: "WestEurope" });

    const up = await stack.up({ onOutput: console.log });

    return up.outputs;
}

export async function destroy() {
    const stack = await LocalWorkspace.createOrSelectStack(args);

    await stack.destroy({ onOutput: console.log });
}

export async function getOutputs(): Promise<OutputMap> {
    
    const stack = await LocalWorkspace.createOrSelectStack(args);

    var outputs = stack.outputs();

    return outputs;
}

export default { deploy, getOutputs, destroy };