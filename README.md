# Panoptes (front end)

![Build Status](https://github.com/zooniverse/Panoptes-Front-End/actions/workflows/ci-tests.yml/badge.svg?branch=master)

[![Coverage Status](https://coveralls.io/repos/github/zooniverse/Panoptes-Front-End/badge.svg)](https://coveralls.io/github/zooniverse/Panoptes-Front-End)

## Getting started

We are no longer actively developing features for this app. PRs will be accepted for bug fixes, translations, and content updates. Active feature development is happening at [https://github.com/zooniverse/front-end-monorepo/](https://github.com/zooniverse/front-end-monorepo/)

### With Docker

To avoid having to install Node.js or any other dependencies, you can run
everything with Docker and Docker Compose.

- `docker-compose build` will build a local Docker image and run `npm ci`. Run this whenever you
change dependencies in `package.json`.

- `docker-compose up` starts a development web server that listens on port 3735.

- `docker-compose down` stops the development server.

- `docker-compose run --rm shell` starts a container running a shell eg. for running tests.

### With Node.js

Make sure you have Node 8 and `npm` 5 or greater. It's recommended you manage your Node installations with **nvm**.

- `npm ci` installs dependencies.

- `npm start` builds and runs the site locally.

Note 1: _[npm ci](https://docs.npmjs.com/cli/v8/commands/npm-ci)_ (clean install) is preferred over _npm install,_ as it doesn't modify the package lock.

⚠️ **Note 2:** as of Node 16.15, running _npm ci_ results in errors such as _npm ERR! ERESOLVE could not resolve_ and _Conflicting peer dependency: foobar@x.y.z_ You can bypass this problem by instead running `npm ci --legacy-peer-deps`. Please see [issue 6155](https://github.com/zooniverse/Panoptes-Front-End/issues/6155) for more details.

### Viewing the Website

Open your web browser of choice and go to `https://localhost:3735/`

If you want to _login_ via the Panoptes API and _view authenticated pages,_ then you'll need to set up and use `https://local.zooniverse.org:3735` instead of using localhost:3735. Otherwise, you'll run into CORS errors. (You need to add the hostname to your hosts file, pointing to local. Instructions are on [our Stackoverflow](https://stackoverflow.com/c/zooniverse/questions/109).)

**Troubleshooting: web browser blocks local website**

The problem: when attempting to view _localhost:3735_ or _local.zooniverse.org:3735,_ my web browser stops me and shows a warning screen.

Example errors: "Your connection is not private / NET::ERR_CERT_AUTHORITY_INVALID" on Chrome 104; "Warning: Potential Security Risk Ahead" on Firefox 103; "This connection is not private" on Safari 15.4.

The cause: the local web server is running HTTPS, and it's using a self-signed certificate. Modern web browsers consider these certificates very untrustworthy, and a possible indicator of a man-in-the-middle attack.

The solution(s):
- For Firefox or Safari, open the _advanced options_ on the warning page, and then click whatever's the equivalent of _"accept risk and continue"._
- For Chrome, type in the _interstitial bypass keyword_ (`thisisunsafe`) anywhere on the window to temporarily bypass the warning; or ⚠️ manually add the SSL cert to your computer's list of trusted certificates. [See Stackoverflow for additional details.](https://stackoverflow.com/questions/7580508/getting-chrome-to-accept-self-signed-localhost-certificate)

⚠️ Warning: please be careful if you do change your web browser's or computer's security settings.

### Configuration

The app can be configured using the following environment variables:

- `NODE_ENV` - sets the environment of the code, and determines whether to apply any production optimizations to the bundled code, and which set of defaults to apply for e.g. API host url, Talk host url etc.
- `PANOPTES_API_APPLICATION` - sets the application ID to use when making authentication requests to the Panoptes API. Defaults to that set by `NODE_ENV`.
- `PANOPTES_API_HOST` - sets the URL of the instance of the Panoptes API. Defaults to that set by `NODE_ENV`.
- `STAT_HOST` - sets the URL of the instance of the Stats API. Defaults to that set by `NODE_ENV`.
- `SUGAR_HOST` - sets the URL of the instance of the Sugar API. Defaults to that set by `NODE_ENV`.
- `TALK_HOST` - sets the URL of the instance of the Talk API. Defaults to that set by `NODE_ENV`.

#### Configuration notes

- Some of these environment variables are set by commands in the `package.json` `scripts` block; in order to override them, you'll need to modify `package.json`.
- To see the defaults set by the `NODE_ENV` environment variable, see [`config.js`](https://github.com/zooniverse/panoptes-javascript-client/blob/master/lib/config.js) in [panoptes-javascript-client](https://github.com/zooniverse/panoptes-javascript-client).

### Development

New GitHub PRs from within the Zooniverse organisation will be staged by Jenkins as part of the CI process. Once CI finishes, your changes should be staged at https://pr-{PR-Number}.pfe-preview.zooniverse.org. Jenkins sometimes times out before finishing the build. If a PR build fails, use the link to Jenkins (from your PR) to log in and try restarting the build.

For testing with production data, you can add `env=production` to your development url, e.g. `localhost:3735/projects?env=production`. Note that it is removed on every page refresh.

All the good stuff is in **./app**. Start at **./app/main.cjsx**

We lint our JavaScript code against a modified version of the [AirBnB style guide](https://github.com/airbnb/javascript). Please lint your changes with eslint, using the .eslintrc file at the root of this repo. If you have any questions, do feel free to ask us on GitHub.

While editing, do your best to follow style and architecture conventions already used by the project. The codebase is large, and styles have evolved during its development. Take a look at [zooniverse/front-end-monorepo](https://github.com/zooniverse/front-end-monorepo) to get an idea of our conventions for organising components.

### What to do if it doesn't run

Try `npm ci` to freshen up your dependencies. And read the warnings, they should tell you if you're using the wrong version of Node or npm or if you're missing any dependencies. If you use `docker-compose` to build and test the site, you shouldn't run into any problems with the Node version, but `docker-compose build` will build a new image with a fresh `npm ci`.

## Testing

If you write a new component, write a test. Each component should have its own `.spec.js` file. The test runner is [Mocha](https://mochajs.org/) and [Enzyme](http://airbnb.io/enzyme/) is available for testing React components.
Mocha throws an error (`Illegal import declaration`) when compiling coffeescript files that contain ES6 import statements with template strings. Convert these imports to `require` statements.
You can run the tests with `npm test`.

## Deployment

Deployment is handled by Github Action.

### Staging

On opening of pull requests, a Github Action is triggered to deploy to a branch staging location. The blob storage location depends on the pull request number, e.g. `https://pr-5926.pfe-preview.zooniverse.org`.

On push to master, a Github Action is triggered to deploy to master staging found at `https://master.pfe-preview.zooniverse.org`.

### Production

Production deployments are triggered by an update to which commit the `production-release` tag is pointed to. This tag should be updated via chat ops and then a Github Action will run that builds and uploads the files to our cloud provider found at `https://www.zooniverse.org`. The production deployment can be run ad hoc in the actions tab as needed if you have the appropriate permissions on the repository, but only do this in an emergency.

## Directory structure

- #### ./app/classifier/

  All things classifier-related.

- #### ./app/collections/

  Collections-related components.

- #### ./app/components/

  Misc generic, reusable components.

- #### ./app/layout/

  App-level layout stuff goes here. If it affects the main site header, the main site footer, or the layout of the main site content, this is where it lives.

- #### ./app/lib/

  Individual functions and data that are reused across components.

- #### ./app/pages/

  This is where the bulk of the app lives. Ideally, each route points to a page component responsible for fetching data and handling any actions the user can perform on that data. That page component uses that data to render the UI with dumb components, passing actions down as necessary.

- #### ./app/partials/

  Originally intended to hold isolated components that wouldn't actually be reused anywhere. These probably belong closer to where they're actually used.

- #### ./app/subjects/

  Subject views (TODOC: How's this related to Talk/collections?)

- #### ./app/talk/

  Talk-related components.

- #### ./public

  Files here will get copied to the output directory during build.

### Classifier tasks

Each task component class should have a couple static components:

- `Summary`: Shows the post-classification summary of the tasks's annotation.

- `Editor`: The component used to edit the workflow task in the project builder.

There are also a few hooks into the rest of the classification interface available, if the task needs to render outside the task area.

- `BeforeSubject`: HTML Content to appear before the subject image during the task.

- `InsideSubject`: SVG Content to appear over the subject image during the task.

- `AfterSubject` HTML Content to appear after the subject image during the task.

These hooks can be prefixed with `Persist`, which will cause them to appear with the task and persist even after the user has moved on to the next task.

`Persist{Before,After}Task` work the same way, but for the task area. Non-persistent hooks are unnecessary for the task area.

Each component also needs a few static methods:

- `getDefaultTask`: Returns the task description to be used as the default when a user adds the task to a workflow in the project builder.

- `getTaskText`: Given a task, this returns a basic text description of the task (e.g. the question in a question task, the instruction in a drawing task, etc.)

- `getDefaultAnnotation`: The annotation to be generated when the classifier begins the task

- `isAnnotationComplete`: Given a task and an annotation, this determines whether or not the classifier will allow the user to move on to the next task.

- `testAnnotationQuality`: Given the user's annotation and a known-good "gold standard" annotation for the same task, this returns a number between 0 (totally wrong) and 1 (totally correct) indicating how close the user's annotation is to the standard.

#### Task editors

Make sure you call `this.props.onChange` with the updated task when it changes.

### Drawing task tools

Some static methods, called from the `MarkInitializer` component, which controls the mark's values during the user's first mark-creating action:

- `defaultValues`: Just some defaults for the mark.

- `initStart`: For every mousedown/touchstart until `isComplete` returns true, return the values for the mark.

- `initMove`" For every mousemove/touchmove, return new values for the mark.

- `initRelease`: For every mouseup/touchend, return new values for the mark.

- `isComplete`: Is the mark complete? Some marks require multiple interactions before the initializer gives up control.

- `initValid`: If a mark is invalid (e.g. a rectangle with zero width or height), it'll be destroyed automatically.

A couple helper components are the `DrawingToolRoot` which handles selected/disabled states and renders sub-task popups, and the `DeleteButton` and `DragHandle`, which render consistent controls for drawing tools. There's also a `deleteIfOutOfBounds` function that should be called after any whole-mark drags.

### Conventions

React requires each component in an array to have a sibling-unique `key`. When rendering arrays of things that do not have IDs (annotations, answers), provide a random `_key` property if it doesn't exist. Ensure underscore-prefixed properties aren't persisted. That's automatic with the `JSONAPIClient.Model` class.

```cjsx
<ul>
  {for item in things
    item._key ?= Math.random()
    <li key={item._key}>{item.label}</li>}
</ul>
```

### Async helper components

There are some ~~nice~~ **unfortunate** (in hindsight) components to help with async values. They take a function as `@props.children`, which looks a little horsey but works rather nicely. Most requested data is cached locally, so these are usually safe, but if you notice the same request being made multiple times in a row, these are a good place to start looking for the redundant calls. Here's an example of re-rendering when a project changes, which results in checking the projects owners.

```cjsx
<ChangeListener target={@props.project}>{=>
  <PromiseRenderer promise={@props.project.get('owners')}>{([owner]) =>
    if owner is @props.user
      <p>This project is yours.</p>
    else
      <p>This project belongs to {owner.display_name}.</p>
  }</PromiseRenderer>
}</ChangeListener>
```

**Do not write new code using `ChangeListener` or `PromiseRenderer`.**

**If it's reasonable, replace `ChangeListener` and `PromiseRenderer` instances with component state in code you work on.** It's more verbose, but it's more readable, and it'll get us closer to rendering on the server in the future.

### CSS conventions

Include any CSS **required for a component's functionality** inline in with component, otherwise keep it in a separate file, one per component. For a given component, pick a unique top-level class name for that component and nest child classes under it. Keep common base styles and variables in **common.styl**. Stylus formatting: Yes colons, no semicolons, no braces. `@extends` up top, then properties (alphabetically), then descendant selectors. Prefer use of `display: flex` and `flex-wrap: wrap` to explicit media queries wherever possible.

Our CSS has gotten really huge, so we're trying out [BEM](http://getbem.com/introduction/) for organization.

```styl
// <special-button.styl>
.special-button
  background: red
  color: white

.special-button__icon
  width: 1em;

// <special-container.styl>
.special-container
  margin: 1em 1vw

  .special-container__button
    border: 1px solid
```

### Writing components in ES6/ES2015

We're migrating from coffeescript to ES6. This can be done incrementally by writing a new component or rewriting an existing component in ES6. A few gotchas should be mentioned:

- The existential operator does not exist in ES6. Either compare explicitly to `null` or use `!!thing` if it just needs to be truthy.

- Native ES6 classes are preferred since `React.createClass()` is deprecated, however, if the existing component is relying on mixins, then consider using `createReactClass()`.

- Mixins are being deprecated and not supported with native classes, so do not use them in new components.

- Use backticks to import ES6 components into coffeescript components:

```
`import NewComponent from './new-component'`
```

An ESLint configuration file is setup in the root of the repository for you to use with your text editor to lint both ES6 and use Airbnb's React style guide.

A [guide](https://reactjs.org/docs/react-without-es6.html) on writing native classes versus using `createReactClass()`

## Custom projects

See the **panoptes-client** library: <https://www.npmjs.com/package/panoptes-client>.

## Format of annotation values

The format of an annotation's value depends on the task used to generate it.

- **single:** The index of the chosen answer.

- **multiple:** An array of the indices of the chosen answers (in the order they were chosen).

- **drawing:** An array of drawing tool marks (descriptions of which follow below).

- **survey:** An array of identifications as objects. Each identification a `choice` (the ID of the identified animal) and `answers`, an object. Each key in `answers` is the ID of a question. If that question allows multiple answers, the value will be an array of answer IDs, otherwise just a single answer ID.

- **crop:** An object containing the `x`, `y`, `width`, and `height` of the cropped region.

- **text:** A string.

- **combo:** A sub-array of annotations.

- **dropdown:** An array of objects where the string `value` refers to the answer to the corresponding question and the boolean `option` indicates that the answer was in the list of options.

### Drawing tool marks

All coordinates are relative to the top-left of the image.

All marks have a `tool`, which is the index of the tool (e.g. `workflow.tasks.T0.tools[0]`) used to make the mark.

All marks contain a `frame`, which is the index of the subject frame (e.g. `subject.locations[0]`) the mark was made on.

If `details` tasks are defined for a tool, its marks will have a `details` array of sub-classifications (each with a `value`, following the descriptions above).

Drawing annotation value are as follows:

- **point:** The `x` and `y` coordinates.

- **line:** The start (`x1`, `y1`) and end (`x2`, `y2`) coordinates.

- **polygon:** An array of objects, each containing the `x` and `y` coordinate of a vertex. If the mark was not explicitly closed by the user, `auto_closed` is `true`.

- **rectangle:** The `x`, `y` coordinate of the top-left point of the rectangle along with its `width` and `height`.

- **circle:** The `x` and `y` coordinate of the center of the circle and its radius `r`.

- **ellipse:** The `x` and `y` coordinate of the center of the ellipse, its radii `rx` and `ry`, and the `angle` of `rx` relative to the x axis in degrees (counterclockwise from 3:00).

- **bezier:** The same as polygon, but every odd-indexed point is the coordinate of the control point of a quadratic bezier curve.

- **column:** The left-most `x` pixel and the `width` of the column selection.

## Acknowledgements

Thanks to [BrowserStack](https://www.browserstack.com) for supporting open
source and allowing us to test this project on multiple platforms.

[![BrowserStack logo](https://static.zooniverse.org/browserstack-logo-300x158.png)](https://www.browserstack.com)

[![pullreminders](https://pullreminders.com/badge.svg)](https://pullreminders.com?ref=badge)
