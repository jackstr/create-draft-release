import * as core from '@actions/core'
import * as lib from "./lib"
import {d} from "./lib"
import {inspect} from "util"

type ReleaseToCreate = {
    tag: lib.TagName
    text: string
};

async function createDraftRelease(release: ReleaseToCreate) {
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
        let text: string[] = [];
        let header: lib.ChangelogHeader | null = null;
        const block = await lib.processFileLines(lib.conf().changelogFilePath, line => {
            if (text.length) {
                if (lib.SemverHeader.match(line) || lib.WeeklyVerHeader.match(line)) {
                    return text;
                }
                text.push(line);
            } else if (line.length) {
                if (lib.SemverHeader.match(line)) {
                    header = new lib.SemverHeader(line);
                } else if (lib.WeeklyVerHeader.match(line)) {
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
        const releaseToCreate: ReleaseToCreate = {
            tag: header!.tag(),
            text: block.join("\n").trimEnd() + "\n",
        };
        await createDraftRelease(releaseToCreate);
    } catch (error) {
        if (lib.conf().debug) {
            console.log(error);
        }
        core.setFailed(error.message);
    }
}

main()
