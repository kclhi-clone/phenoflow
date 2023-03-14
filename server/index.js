const express = require('express')
const phenotypes = require('./phenotypes-reduced.json')
const app = express()

// Necessary to parse
app.use(express.json())

const PORT = 3000

// Project details
const OWNER = 'kclhi-clone'
const REPO = 'phenoflow'

// User details
const NAME = 'Admin'
const EMAIL = 'obed.ngigi@kcl.ac.uk'

let AUTH_TOKEN = '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'

// Octokit.js
// https://github.com/octokit/core.js#readme
const { Octokit } = require("octokit");
const octokit = new Octokit({
  auth: AUTH_TOKEN
})

// GitHub api invokation quota information
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
// Get all phenotypes
app.get("/", async(request, response) => {
  let author = req.query.author;

  try {
    if(author) {}
    else{
      const res = await octokit.request('GET /orgs/{org}/repos', {
          org: OWNER,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
      });
    }

    return response.status(200).send(res.data)
  } catch (error) {
    return response.status(400).send(error)
  }
});

// Get a single phenotype, by name
app.get("/:name", async(request, response) => {
  const name = request.params.name.toLowerCase()

  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: OWNER,
      repo: name,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, { accept: 'application/vnd.github+json' })

    return response.status(200).send(res.data)
  } catch (error) {
    return response.status(400).send(error)
  }
});

// Get description of a single phenotype, by name
app.get("/:name/description", async(request, response) => {
  const name = request.params.name.toLowerCase()

  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}/readme', {
      owner: OWNER,
      repo: name,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, { accept: 'application/vnd.github.raw' });

    const readmeBuffer = Buffer.from(res.data.content, 'base64');
    var readmeArray = [];
    for(const value of readmeBuffer.values()) {
      hexValue = value.toString(16)
      if (hexValue.length == 1) {
        hexValue = `0${hexValue}`
      }
      readmeArray.push(hexValue)
    }

    var startIndex;
    // Finds start index of the phenotype description
    // within bufferArrary
    for(var index = 1; index < readmeArray.length; index++) {
      if (readmeArray[index - 1] == '2d' && readmeArray[index] == '20') {
        startIndex = index + 1;
        break;
      }
    }

    var endIndex;
    // Finds end index of the phenotype description
    // within bufferArrary
    for(var index = 0; index < readmeArray.length; index++) {
      if (readmeArray[index] == '0a' && readmeArray[index + 1] == '0a'
      && readmeArray[index + 2] == '23' && readmeArray[index + 3] == '23') {
        endIndex = index;
        break;
      }
    }

    descriptionArray = readmeArray.slice(startIndex, endIndex)
    outputBuffer = Buffer.from(readmeArray.flat().join(''), 'hex')

    return response.status(200).send(outputBuffer.toString())
  } catch (error) {
    return response.status(400).send(error)
  }
});

app.get("/file/:name", async(request, response) => {
  return response.send(error)
});

/**
* Create
*/
async function uploadPhenotype(phenotype) {
  const name = String(phenotype.name).toLowerCase()
  
  try {
    await octokit.request('POST /orgs/{org}/repos', {
      
      org: OWNER,
      name: name,
      description: `This is the ${name} phenotype. Created by ${NAME}`,
      'private': false,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      auto_init: true,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    console.log(`Uploaded ${name} phenotype`)
  } catch (error) {
    console.log(error)
  } finally {
    setTimeout(3000);
  }
};

// Create empty phenotypes from ./phenotypes-reduced.json
app.post("/initialise", async (request, response) => {

  try {
    const remotePhenotypes = await octokit.request('GET /orgs/{org}/repos', {
      org: OWNER,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    var remoteNames = [];
    remotePhenotypes.data.forEach(phenotype => {
      remoteNames.push(phenotype.name)
    });

    const promises = phenotypes.map(async (phenotype) => {
      if (!remoteNames.includes(phenotype)) {
        await uploadPhenotype(phenotype);
      }
    });  

    await Promise.all(promises);
    console.log('data', data)
    response.status(200).send(data);
  } catch (error) {
    console.log(error);
    response.status(500)
  }
});

// Create empty phenotype with name
app.post("/create/:name", async(request, response) => {
  const name = request.params.name.toLowerCase()

  try {
    await octokit.request('POST /orgs/{org}/repos', {
      
      org: OWNER,
      name: name,
      description: `This is the ${name} phenotype. Created by ${NAME}.`,
      'private': false,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      auto_init: true,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    console.log(`Created ${name} phenotype`)
  } catch (error) {
    console.log(error)
  }
});

// TODO: Implement
app.post("/create/file/:name", async(request, response) => {
  response.send(error)
});

/**
* Update
*/
app.put("/update", async(request, response) => {
  response.send(error)
});

// TODO: Implement
app.put("/update/:name/description/:step", async(request, response) => {
  response.send(error)
});

// Update description of a single phenotype, by name
app.put("/update/:name/description", async(request, response) => {
  const name = request.params.name.toLowerCase()
  const description = request.body.description

  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}/readme', {
      owner: OWNER,
      repo: name,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, { accept: 'application/vnd.github.raw' })
    
    const descriptionBuffer = Buffer.from(description, 'utf-8')
    var descriptionArray = [];
    for(const value of descriptionBuffer.values()) {
      descriptionArray.push(value.toString(16))
    }

    const readmeBuffer = Buffer.from(res.data.content, 'base64');
    var readmeArray = [];
    for(const value of readmeBuffer.values()) {
      hexValue = value.toString(16)
      if (hexValue.length == 1) {
        hexValue = '0' + hexValue
      }
      readmeArray.push(hexValue)
    }

    var startIndex;
    // Finds start index of the phenotype description
    // within bufferArrary
    for(var index = 1; index < readmeArray.length; index++) {
      if (readmeArray[index - 1] == '2d' && readmeArray[index] == '20') {
        startIndex = index + 1;
        break;
      }
    }

    var endIndex;
    // Finds end index of the phenotype description
    // within bufferArrary
    for(var index = 0; index < readmeArray.length; index++) {
      if (readmeArray[index] == '0a' && readmeArray[index + 1] == '0a'
      && readmeArray[index + 2] == '23' && readmeArray[index + 3] == '23') {
        endIndex = index;
        break;
      }
    }

    difference = endIndex - startIndex

    readmeArray.splice(startIndex, difference, descriptionArray)
    outputBuffer = Buffer.from(readmeArray.flat().join(''), 'hex')

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: OWNER,
      repo: name,
      path: 'README.md',
      message: 'Changed ' + name + ' description.',
      committer: {
        name: NAME,
        email: EMAIL
      },
      content: outputBuffer.toString('base64'),
      sha: res.data.sha,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return response.status(200).send(outputBuffer.toString())
  } catch (error) {
    return response.status(400).send(error)
  }
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

// Delete all phenotypes
app.delete("/delete", async(request, response) => {

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

// Delete a single phenotype, by name
app.delete("/delete/:name", async(request, response) => {
  const name = request.params.name.toLowerCase()
  deletePhenotype(name, true)
});

app.listen(PORT, () => {
  console.log(`phenoflow/test app listening on port ${PORT}`)
});
