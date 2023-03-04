const express = require('express')
const phenotypes = require('./phenotypes.json')
const app = express()

const PORT = 3000
const OWNER = 'kclhi-clone'
const REPO = 'phenoflow'
const NAME = 'Admin'
const EMAIL = 'obed.ngigi@kcl.ac.uk'

const HELLO_WORLD_CWL = "Y3dsVmVyc2lvbjogdjEuMgoKIyBXaGF0IHR5cGUgb2YgQ1dMIHByb2Nlc3Mgd2UgaGF2ZSBpbiB0aGlzIGRvY3VtZW50LgpjbGFzczogQ29tbWFuZExpbmVUb29sCiMgVGhpcyBDb21tYW5kTGluZVRvb2wgZXhlY3V0ZXMgdGhlIGxpbnV4ICJlY2hvIiBjb21tYW5kLWxpbmUgdG9vbC4KYmFzZUNvbW1hbmQ6IGVjaG8KCiMgVGhlIGlucHV0cyBmb3IgdGhpcyBwcm9jZXNzLgppbnB1dHM6CiAgbWVzc2FnZToKICAgIHR5cGU6IHN0cmluZwogICAgIyBBIGRlZmF1bHQgdmFsdWUgdGhhdCBjYW4gYmUgb3ZlcnJpZGRlbiwgZS5nLiAtLW1lc3NhZ2UgIkhvbGEgbXVuZG8iCiAgICBkZWZhdWx0OiAiSGVsbG8gV29ybGQiCiAgICAjIEJpbmQgdGhpcyBtZXNzYWdlIHZhbHVlIGFzIGFuIGFyZ3VtZW50IHRvICJlY2hvIi4KICAgIGlucHV0QmluZGluZzoKICAgICAgcG9zaXRpb246IDEKb3V0cHV0czogW10="
let AUTH_TOKEN = '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'

// Octokit.js
// https://github.com/octokit/core.js#readme
const { Octokit } = require("octokit");
const octokit = new Octokit({
  auth: AUTH_TOKEN
})

app.get("/rate", async(request, response) => {
  try {
    const res = await octokit.request('GET /rate_limit', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    
    return response.status(200).send(res.data)
  } catch (error) {
    return response.status(400).send(error)
  }
  
})

/**
 * Read
 */
app.get("/", async(request, response) => {

  try {
    const res = await octokit.request('GET /orgs/{org}/repos', {
        org: OWNER,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    return response.status(200).send(res.data)
  } catch (error) {
    return response.status(400).send(error)
  }
});

app.get("/:name", async(request, response) => {
  const name = request.params.name.toLowerCase()

  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}/', {
      owner: OWNER,
      repo: name,
    })

    return response.status(200).send(res.data)
  } catch (error) {
    return response.status(400).send(error)
  }
});

/**
* Create
*/
app.post("/", async(request, response) => {
  response.send(error)
});

/**
* Update
*/

async function uploadPhenotype(phenotype) {
  const name = String(phenotype.name).toLowerCase()
  
  try {
    await octokit.request('PATCH /orgs/{org}/repos', {
      org: OWNER,
      name: name,
      description: `This is the ${name} phenotype`,
      'private': true,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    console.log(`Uploaded ${name} phenotype`)
  } catch (error) {
    console.log(error)
  } 
};

app.put("/initialise", async (request, response) => {
  try {
    const promises = phenotypes.map(async (phenotype) => {
      await uploadPhenotype(phenotype);
    });

    /** phenotypes.forEach(phenotype => {
      await uploadPhenotype(phenotype);
    }); */

    await Promise.all(promises);
    response.status(200);
  } catch (error) {
    console.log(error);
    response.status(500)
  }
});

app.put("/", async(request, response) => {
  response.send(error)
});

app.put("/:name", async(request, response) => {
  response.send(error)
});

/**
* Delete
*/
async function deletePhenotype(name, final) {

  try {

    await octokit.request('DELETE /repos/{owner}/{repo}', {
      owner: OWNER,
      repo: name,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    console.log(`Deleted ${name} phenotype`)
    if (final) { return 1 }
  } catch (error) {
    console.log(error)
    return 0
  } 
};

app.delete("/", async(request, response) => {

  try {
    const res = await octokit.request('GET /orgs/{org}/repos', {
      org: OWNER,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
  })

    const size = res.data.length
    for(let index = 0; index < size; index ++) {
      let phenotype = res.data[index]
      if (phenotype.name != REPO) {
        deletePhenotype(phenotype.name, ((index + 1) == size) ? true : false)
      }
    };
    return response.status(200).send(res.data)
  } catch (error) {
    return response.status(400).send(error)
  }
});

app.delete("/:name", async(request, response) => {
  const name = request.params.name.toLowerCase()
  deletePhenotype(name, true)
});

app.listen(PORT, () => {
  console.log(`phenoflow/test app listening on port ${PORT}`)
});
