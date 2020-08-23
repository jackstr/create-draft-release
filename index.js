"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const lib = __importStar(require("./lib"));
async function createDraftRelease(release) {
    const client = lib.githubClient();
    const res = await client.repos.createRelease({
        owner: client.repoMeta.owner,
        repo: client.repoMeta.repo,
        tag_name: release.tag,
        name: release.tag,
        body: release.text,
        draft: true,
        prerelease: true,
    });
    core.info(res.data.url);
}
async function main() {
    try {
        core.setSecret(lib.conf().token);
        let text = [];
        let header = null;
        const block = await lib.processFileLines(lib.conf().changelogFilePath, line => {
            if (text.length) {
                if (lib.SemverHeader.match(line) || lib.WeeklyVerHeader.match(line)) {
                    return text;
                }
                text.push(line);
            }
            else if (line.length) {
                if (lib.SemverHeader.match(line)) {
                    header = new lib.SemverHeader(line);
                }
                else if (lib.WeeklyVerHeader.match(line)) {
                    header = new lib.WeeklyVerHeader(line);
                }
                if (header) {
                    text.push(line);
                }
            }
            return false;
        });
        if (!block) {
            return;
        }
        const releaseToCreate = {
            tag: header.tag(),
            text: block.join("\n").trimEnd() + "\n",
        };
        await createDraftRelease(releaseToCreate);
    }
    catch (error) {
        if (lib.conf().debug) {
            console.log(error);
        }
        core.setFailed(error.message);
    }
}
main();
//# sourceMappingURL=index.js.map