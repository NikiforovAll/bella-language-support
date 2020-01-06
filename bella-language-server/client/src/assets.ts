import * as path from 'path';
import * as fs from 'fs-extra';
import * as vscode from 'vscode';

import { tolerantParse } from './json';
import { deleteIfExists, getWorkspaceInformation, WorkspaceFolderInformation} from './common';
export interface AssetOperations {
    addTasksJson?: boolean;
    updateTasksJson?: boolean;
    addLaunchJson?: boolean;
}

export class AssetGenerator {
    public workspaceFolder: vscode.WorkspaceFolder;
    public vscodeFolder: string;
    public tasksJsonPath: string;
    public launchJsonPath: string;
    public invokePSFile: string;
    public compilePSFile: string;
    public workspaceInfo: WorkspaceFolderInformation;

    public constructor(workspaceFolder: vscode.WorkspaceFolder = undefined) {
        if (workspaceFolder) {
            this.workspaceFolder = workspaceFolder;
        }
        else {
            this.workspaceInfo = getWorkspaceInformation();
            this.workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(this.workspaceInfo.rootPath));
        }

        this.vscodeFolder = path.join(this.workspaceFolder.uri.fsPath, '.vscode');
        this.tasksJsonPath = path.join(this.vscodeFolder, 'tasks.json');
        this.launchJsonPath = path.join(this.vscodeFolder, 'launch.json');
        this.invokePSFile = path.join(this.vscodeFolder, 'Invoke.ps1');
        this.compilePSFile = path.join(this.vscodeFolder, 'CompileAllComponents.ps1');
    }

    private createBuildTaskDescription(): any {
        let commandArgs = [
            "-ExecutionPolicy",
            "Unrestricted",
            "-NoProfile",
            "-File",
            "./.vscode/Invoke.ps1"
        ];
        let presentation = {
            "echo": true,
            "reveal": "always",
            "focus": true,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
        }
        let group = {
            kind: "build",
            isDefault: true
        };
        return {
            label: 'build',
            command: 'powershell',
            problemMatcher: [],
            type: 'shell',
            args: commandArgs,
            presentation,
            detail: "Build All Components",
            group
        };
    }

    private createRunComponentTaskDescription(): any {
        let commandArgs = [
            "-ExecutionPolicy",
            "Unrestricted",
            "-NoProfile",
            "-File",
            "./.vscode/Invoke.ps1", "-componentRegex","'${input:componentName}'", "-run"
        ];
        let presentation = {
            "echo": true,
            "reveal": "always",
            "focus": true,
            "panel": "shared",
            "showReuseMessage": true,
            "clear": false
        }
        let group = {
            kind: "build",
            isDefault: true
        };
        return {
            label: 'run-component',
            command: 'powershell',
            problemMatcher: [],
            type: 'shell',
            args: commandArgs,
            presentation,
            detail: "Build and Run Component",
            group
        };
    }


    public createTasksConfiguration(): any {
        let tasksInput = [{
            id: "componentName",
            description: "Specify regex expression for component name. E.g. BillingEngine, Billing*",
            type: "promptString"
        }];
        return {
            version: "2.0.0",
            tasks: [this.createBuildTaskDescription(), this.createRunComponentTaskDescription()],
            inputs: tasksInput
        };
    }
}

enum PromptResult {
    Yes,
    No,
    Disable
}

interface PromptItem extends vscode.MessageItem {
    result: PromptResult;
}

async function promptToAddAssets(workspaceFolder: vscode.WorkspaceFolder) {
    return new Promise<PromptResult>((resolve, reject) => {
        const yesItem: PromptItem = { title: 'Yes', result: PromptResult.Yes };
        const noItem: PromptItem = { title: 'Not Now', result: PromptResult.No, isCloseAffordance: true };
        const disableItem: PromptItem = { title: "Don't Ask Again", result: PromptResult.Disable };

        const projectName = path.basename(workspaceFolder.uri.fsPath);

        vscode.window.showWarningMessage(
            `Required assets to build and debug are missing from '${projectName}'. Add them?`, disableItem, noItem, yesItem)
            .then(selection => resolve(selection.result));
    });
}
export async function addInvokePSScript(generator: AssetGenerator) {
    return new Promise<void>((resolve, reject) => {
        const script = `
param (
    [switch]$run,
    [string]$componentRegex = "*"
)

set-alias ?: Invoke-Ternary -Option AllScope -Description "PSCX filter alias"
filter Invoke-Ternary ([scriptblock]$decider, [scriptblock]$ifTrue, [scriptblock]$ifFalse)
{
    if (&$decider) {
        &$ifTrue
    } else {
        &$ifFalse
    }
}

Write-Host "Regex:" $componentRegex
Write-Host "IsRun:" $run
$scriptpath=".\\.vscode\\CompileAllComponents.ps1"
$a = "$scriptpath -componentRegex " + $componentRegex + " -run " + (?: {$run} {'$true'} {'$false'})
Start-Process -Verb runas -FilePath powershell.exe -ArgumentList $a -wait -PassThru | Out-Null
`
        fs.writeFile(generator.invokePSFile, script, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

export async function addCompilePSScript(generator: AssetGenerator) {
    return new Promise<void>((resolve, reject) => {
        const script = `
param (
    [bool]$run = $false,
    [string]$componentRegex = "*"
    )

set-alias ?: Invoke-Ternary -Option AllScope -Description "PSCX filter alias"
filter Invoke-Ternary ([scriptblock]$decider, [scriptblock]$ifTrue, [scriptblock]$ifFalse)
{
    if (&$decider) {
        &$ifTrue
    } else {
        &$ifFalse
    }
}

function RunBellaComponent($exePath){
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $exePath
    $arguments = '-console ' + (?: {$run} {''} {'-compileOnly'})
    Write-Host "Starting component $exePath, args: $arguments"
    $pinfo.Arguments = $arguments
    $pinfo.RedirectStandardError = $true
    $pinfo.RedirectStandardOutput = $true
    $pinfo.UseShellExecute = $false
    $pinfo.WorkingDirectory = [System.IO.Path]::GetDirectoryName($exePath)
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $pinfo
    $p.Start() | Out-Null
    $handle = $p.Handle # cache proc.Handle http://stackoverflow.com/a/23797762/1479211
    # $p.WaitForExit()
    $stdout = $p.StandardOutput.ReadToEnd()
    Write-Host $stdout
    return $p.ExitCode
}

$hasError = $false
$path = 'src/Domain/*/' + $componentRegex
$files = Get-ChildItem "BellaDomain.exe" -Path $path -Recurse

$numberOfComponents=0

foreach ($file in $files)
{
    if($file.FullName -notmatch '.*BellaDomain.exe'){
        continue
    }
    $numberOfComponents++
    Write-Host $file.FullName
    $exitCode = RunBellaComponent($file.FullName)
    $hasError = $hasError -or -not ($exitCode -eq 0)
}

Write-Host "Number of processed components: $($numberOfComponents)"

if($hasError){
    Write-Error 'Compile of bella components failed!'
    # return 1
}
else{
    Write-Host 'Success!'
}

Write-Host 'Press any key to exit...'

Read-Host

Write-Host 'Exit'
`
            fs.writeFile(generator.compilePSFile, script, err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
}
export async function addTasksJsonIfNecessary(generator: AssetGenerator, operations: AssetOperations) {
    return new Promise<void>((resolve, reject) => {
        if (!operations.addTasksJson && !operations.updateTasksJson) {
            return resolve();
        }

        const tasksJson = generator.createTasksConfiguration();

        // NOTE: We only want to do this when we are supposed to update the task configuration. Otherwise,
        // in the case of the 'generateAssets' command, even though we already deleted the tasks.json file
        // this will still return the old tasks.json content
        if (operations.updateTasksJson) {
            const tasksConfigs = vscode.workspace.getConfiguration('tasks');
            let existingTaskConfigs = tasksConfigs.get<Array<any>>('tasks');

            if (existingTaskConfigs) {
                tasksJson['tasks'] = tasksJson['tasks'].concat(existingTaskConfigs);
            }
        }

        const tasksJsonText = JSON.stringify(tasksJson, null, '    ');
        fs.writeFile(generator.tasksJsonPath, tasksJsonText, err => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
}

function indentJsonString(json: string, numSpaces: number = 4): string {
    return json.split('\n').map(line => ' '.repeat(numSpaces) + line).join('\n').trim();
}


async function addAssets(generator: AssetGenerator, operations: AssetOperations) {

    const promises = [
        addTasksJsonIfNecessary(generator, operations),
        addInvokePSScript(generator),
        addCompilePSScript(generator)
        // addLaunchJsonIfNecessary(generator, operations)
    ];
    return Promise.all(promises);
}

export enum AddAssetResult {
    NotApplicable,
    Done,
    Disable,
    Cancelled
}

export async function addAssetsIfNecessary(): Promise<AddAssetResult> {
    return new Promise<AddAssetResult>((resolve, reject) => {
        if (!vscode.workspace.workspaceFolders) {
            return resolve(AddAssetResult.NotApplicable);
        }
        const generator = new AssetGenerator();
        let operations: AssetOperations  = {
            addTasksJson: true
        };
        promptToAddAssets(generator.workspaceFolder).then(result => {
            if (result === PromptResult.Disable) {
                return resolve(AddAssetResult.Disable);
            }

            if (result !== PromptResult.Yes) {
                return resolve(AddAssetResult.Cancelled);
            }
            fs.ensureDir(generator.vscodeFolder, err => {
                addAssets(generator, operations).then(() =>
                    resolve(AddAssetResult.Done));
            });
        }).catch(err => reject(err));
    });
}

async function doesAnyAssetExist(generator: AssetGenerator) {
    return new Promise<boolean>((resolve, reject) => {
        fs.exists(generator.launchJsonPath, exists => {
            if (exists) {
                resolve(true);
            }
            else {
                fs.exists(generator.tasksJsonPath, exists => {
                    resolve(exists);
                });
            }
        });
    });
}

async function deleteAssets(generator: AssetGenerator) {
    return Promise.all([
        // deleteIfExists(generator.launchJsonPath),
        deleteIfExists(generator.tasksJsonPath),
        deleteIfExists(generator.compilePSFile),
        deleteIfExists(generator.invokePSFile)
    ]);
}

async function shouldGenerateAssets(generator: AssetGenerator): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        doesAnyAssetExist(generator).then(res => {
            if (res) {
                const yesItem = { title: 'Yes' };
                const cancelItem = { title: 'Cancel', isCloseAffordance: true };
                vscode.window.showWarningMessage('Replace existing build and debug assets?', cancelItem, yesItem)
                    .then(selection => {
                        if (selection === yesItem) {
                            resolve(true);
                        }
                        else {
                            // The user clicked cancel
                            resolve(false);
                        }
                    });
            }
            else {
                // The assets don't exist, so we're good to go.
                resolve(true);
            }
        });

    });
}

export async function generateAssets(): Promise<void> {
    try {
        const generator = new AssetGenerator();
        if (generator.workspaceInfo.isValidProject) {
            let doGenerateAssets = await shouldGenerateAssets(generator);
            if (!doGenerateAssets) {
                return; // user cancelled
            }

            const operations: AssetOperations = {
                addTasksJson: true
            };

            await deleteAssets(generator);
            await fs.ensureDir(generator.vscodeFolder);
            await addAssets(generator, operations);
        }
        else {
            await vscode.window.showErrorMessage("Could not locate Bella project. Assets were not generated.");
        }
    }
    catch (err) {
        await vscode.window.showErrorMessage(`Unable to generate assets to build and debug. ${err}`);
    }
}
