import { LocalProgramArgs, LocalWorkspace, OutputMap } from "@pulumi/pulumi/automation";
import * as crypto from "crypto";
import * as upath from "upath";

const randomString = crypto.randomBytes(8).toString('hex');

const args: LocalProgramArgs = {
    stackName: `integration-tests-${randomString}`,
    workDir: upath.joinSafe(__dirname, "..", "Lab3-Snapshot"),
};

export async function deploy(): Promise<OutputMap> {
    
    console.log(`initialising stack in directory ${args.workDir}...`);
    const stack = await LocalWorkspace.createOrSelectStack(args);

    console.log("setting azure location...");
    await stack.setConfig("azure-native:location", { value: "WestEurope" });

    console.log("pulumi up...");
    const up = await stack.up({ onOutput: console.log });

    return up.outputs;
}

export async function destroy() {
    const stack = await LocalWorkspace.createOrSelectStack(args);

    console.log(`destroying stack ${stack.name}`);
    await stack.destroy({ onOutput: console.log });
}

export async function getOutputs(): Promise<OutputMap> {
    
    const stack = await LocalWorkspace.createOrSelectStack(args);

    var outputs = stack.outputs();

    return outputs;
}

export default { deploy, getOutputs, destroy };