const Image = require("@11ty/eleventy-img");
const path = require("path");
const CleanCSS = require("clean-css");
const fg = require('fast-glob');
const fs = require('fs');
const { minify } = require("terser");
const htmlmin = require("html-minifier");
// const faviconsPlugin = require("eleventy-plugin-gen-favicons");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");

const config = require('./src/_data/config');

module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy("src/img");
    eleventyConfig.addPassthroughCopy("src/assets/fonts");
    // Copy favicons to root
    eleventyConfig.addPassthroughCopy({ "src/icon/": "/" });

    // CSS Minifier
    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // Favicons plugin
    // eleventyConfig.addPlugin(faviconsPlugin, {});

    // Sitemap plugin
    eleventyConfig.addPlugin(sitemap, {
        sitemap: {
            hostname: config.baseUrl,
            changefreq: "weekly",
            priority: 1.0,
        },
    });

    // Navigation plugin
    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    // IncludeByGlob Shortcode
    eleventyConfig.addShortcode("include-glob", function (glob) {
        const files = fg.sync(glob);
        let text = '';
        for (let file of files) {
            try {
                const data = fs.readFileSync(file, 'utf-8');
                text += data;
            } catch (err) {
                console.log(err);
            }
        }
        return text;
    });

    // JS Minifier
    eleventyConfig.addAsyncFilter("jsmin", async function (code) {
        try {
            const minified = await minify(code);
            return minified.code;
        } catch (err) {
            console.error("Terser error: ", err);
            // Fail gracefully.
            return code;
        }
    });

    // Print File content directly into HTML. For SVG images and more.
    eleventyConfig.addFilter('printFileContents', function (filePath) {
        const relativeFilePath = filePath; //`.` + filePath;
        const fileContents = fs.readFileSync(relativeFilePath, (err, data) => {
            if (err) throw err;
            return data;
        });

        return fileContents.toString('utf8');
    });

    /**
     * Parses a file system path and returns either the file name or directory.
     * @param {string} path
     * @param {'name'|'dir'} key
     */
    const pathParse = (path, key) => path.parse(path)[key];

    /**
     * Joins an arbitrary number of paths using the OS separator.
     * @param {string[]} paths
     */
    const pathJoin = (...paths) => path.join(...paths);

    eleventyConfig.addFilter('pathParse', pathParse);
    eleventyConfig.addFilter('pathJoin', pathJoin);

    /**
     * Prefixes the given URL with the site's base URL.
     * @param {string} url
     */
    const toAbsoluteUrl = (url) => {
        return new URL(url, config.baseUrl).href;
    }

    eleventyConfig.addFilter('toAbsoluteUrl', toAbsoluteUrl);

    eleventyConfig.addTransform("htmlmin", function (content) {
        if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
                preserveLineBreaks: true,
                minifyJS: true
            });
            return minified;
        }
        return content;
    });

    // Watch for all files in src/asssets/  
    eleventyConfig.addWatchTarget("src/assets/**/*.*");

    // 11-ty Image Plugin Shortcode
    eleventyConfig.addShortcode("respImage", async function (src, alt, sizes = "100vw", loading = "lazy") {
        if (alt === undefined) {
            // You bet we throw an error on missing alt (alt="" works okay)
            throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
        }

        const imageSrc = `src/${src}`;
        const imageDir = `${path.dirname(src)}`;

        let metadata = await Image(imageSrc, {
            widths: [300, 600, 1100, 1500, 1800, 2000, 2400],
            formats: ['webp', 'jpeg'],
            outputDir: `./_site/img/${imageDir}`,
            urlPath: `/img/${imageDir}`,
            filenameFormat: function (id, src, width, format, options) {
                const extension = path.extname(src);
                const name = path.basename(src, extension);
                return `${name}-${width}w.${format}`;
            },
            sharpJpegOptions: {
                mozjpeg: true
            }
        });

        // let imageAttributes = {
        //     alt,
        //     sizes,
        //     loading: "lazy"
        // };

        // return Image.generateHTML(metadata, imageAttributes);

        let lowsrc = metadata.jpeg[0];
        let highsrc = metadata.jpeg[metadata.jpeg.length - 1];
        let loadingAttr = loading === 'lazy' ? 'loading="lazy"' : 'fetchpriority="high"';

        return `<picture>
            ${Object.values(metadata).map(imageFormat => {
            return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
        }).join("\n")}
                <img
                    src="${lowsrc.url}"
                    width="${highsrc.width}"
                    height="${highsrc.height}"
                    alt="${alt}"
                    ${loadingAttr}
                    decoding="async">
            </picture>`;
    });

    // 11-ty Image Plugin Shortcode FROM URL
    eleventyConfig.addShortcode("respImageURL", async function (src, alt, sizes = "100vw", loading = "lazy") {
        if (alt === undefined) {
            // You bet we throw an error on missing alt (alt="" works okay)
            throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
        }

        const imageSrc = `src/${src}`;
        const imageDir = `${path.dirname(src)}`;

        let metadata;

        try {
            metadata = await Image(src, {
                widths: [300, 600, 1100, 1500, 1800, 2000, 2400],
                formats: ['webp', 'jpeg'],
                outputDir: `./_site/img/`,
                sharpJpegOptions: {
                    mozjpeg: true
                }
            });
        } catch (e) {
            // console.log(e);
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
            <circle fill="blue" stroke="none" cx="500" cy="500" r="375"/>
        </svg>`;
        }


        let lowsrc = metadata.jpeg[0];
        let highsrc = metadata.jpeg[metadata.jpeg.length - 1];
        let loadingAttr = loading === 'lazy' ? 'loading="lazy"' : 'fetchpriority="high"';

        return `<picture>
            ${Object.values(metadata).map(imageFormat => {
            return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
        }).join("\n")}
                <img
                    src="${lowsrc.url}"
                    width="${highsrc.width}"
                    height="${highsrc.height}"
                    alt="${alt}"
                    ${loadingAttr}
                    decoding="async">
            </picture>`;
    });

    return {
        dir: {
            input: "src",
            output: "_site"
        }
    }
};