/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

let extensionPath: string;

export function setExtensionPath(path: string) {
    extensionPath = path;
}

export function getExtensionPath() {
    if (!extensionPath) {
        throw new Error('Failed to set extension path');
    }

    return extensionPath;
}

export function isBoolean(obj: any): obj is boolean {
    return obj === true || obj === false;
}

export function sum<T>(arr: T[], selector: (item: T) => number): number {
    return arr.reduce((prev, curr) => prev + selector(curr), 0);
}

/** Retrieve the length of an array. Returns 0 if the array is `undefined`. */
export function safeLength<T>(arr: T[] | undefined) {
    return arr ? arr.length : 0;
}

export async function buildPromiseChain<T, TResult>(array: T[], builder: (item: T) => Promise<TResult>): Promise<TResult> {
    return array.reduce(
        async (promise, n) => promise.then(async () => builder(n)),
        Promise.resolve<TResult>(null));
}

export async function execChildProcess(command: string, workingDirectory: string = getExtensionPath()): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        cp.exec(command, { cwd: workingDirectory, maxBuffer: 500 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else if (stderr && stderr.length > 0) {
                reject(new Error(stderr));
            }
            else {
                resolve(stdout);
            }
        });
    });
}

export async function getUnixChildProcessIds(pid: number): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
        let ps = cp.exec('ps -A -o ppid,pid', (error, stdout, stderr) =>
        {
            if (error) {
                return reject(error);
            }

            if (stderr) {
                return reject(stderr);
            }

            if (!stdout) {
                return resolve([]);
            }

            let lines = stdout.split(os.EOL);
            let pairs = lines.map(line => line.trim().split(/\s+/));

            let children = [];

            for (let pair of pairs) {
                let ppid = parseInt(pair[0]);
                if (ppid === pid) {
                    children.push(parseInt(pair[1]));
                }
            }

            resolve(children);
        });

        ps.on('error', reject);
    });
}

export async function fileExists(filePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (stats && stats.isFile()) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}

export async function deleteIfExists(filePath: string): Promise<void> {
    return fileExists(filePath)
    .then(async (exists: boolean) => {
        return new Promise<void>((resolve, reject) => {
            if (!exists) {
                return resolve();
            }

            fs.unlink(filePath, err => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    });
}

export enum InstallFileType {
    Begin,
    Lock
}

export function convertNativePathToPosix(pathString: string): string {
    let parts = pathString.split(path.sep);
    return parts.join(path.posix.sep);
}

/**
 * This function checks to see if a subfolder is part of folder.
 *
 * Assumes subfolder and folder are absolute paths and have consistent casing.
 *
 * @param subfolder subfolder to check if it is part of the folder parameter
 * @param folder folder to check aganist
 */
export function isSubfolderOf(subfolder: string, folder: string): boolean {
    const subfolderArray: string[] = subfolder.split(path.sep);
    const folderArray: string[] = folder.split(path.sep);

    // Check to see that every sub directory in subfolder exists in folder.
    return subfolderArray.length <= folderArray.length && subfolderArray.every((subpath, index) => folderArray[index] === subpath);
}


export interface WorkspaceFolderInformation {
    isValidProject: boolean,
    rootPath: string,
    domainPath: string
    componentsPath: string
    commonPath: string,
    sourceCodeLocationRelativePath: string
    tasksGenerated: boolean
}

export function getWorkspaceInformation(): WorkspaceFolderInformation {
    // vscode.workspace.workspaceFolders[0];
    const rootPath = vscode.workspace.rootPath;
    const sourceCodeLocation = vscode.workspace.getConfiguration().get('bellaLanguageServer.sourceCodeLocation', 'src/Domain');
    const domainPath = path.join(rootPath, sourceCodeLocation);
    const isValidProject = fs.existsSync(domainPath);
    return {
        isValidProject,
        rootPath,
        sourceCodeLocationRelativePath: sourceCodeLocation,
        domainPath,
        componentsPath: path.join(domainPath, 'components'),
        commonPath: path.join(domainPath, 'common'),
        tasksGenerated: fs.existsSync(path.join(rootPath, '.vscode', 'tasks.json'))
    };
}
