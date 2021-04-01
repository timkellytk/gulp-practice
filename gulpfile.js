const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const { src, series, parallel, dest, watch } = require("gulp");

const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();

// compile scss into css
function style() {
  return src("./scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(dest("./css"))
    .pipe(browserSync.stream());
}

function watchTut() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
  watch("./scss/**/*.scss", style);
  watch("./**/*.html").on("change", browserSync.reload);
  watch("./js/**/*.js", style).on("change", browserSync.reload);
}

const jsPath = "src/assets/js/**/*.js";
const cssPath = "src/assets/scss/**/*.scss";

function copyHtml() {
  return src("src/*.html").pipe(gulp.dest("dist"));
}

function imgTask() {
  return src("src/images/*").pipe(imagemin()).pipe(gulp.dest("dist/images"));
}

function jsTask() {
  return src(jsPath)
    .pipe(sourcemaps.init())
    .pipe(concat("all.js"))
    .pipe(terser())
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist/assets/js"));
}

function scssTask() {
  return src(cssPath)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(concat("style.css"))
    .pipe(postcss([autoprefixer(), cssnano()])) //not all plugins work with postcss only the ones mentioned in their documentation
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist/assets/css"));
}

function watchTask() {
  watch([cssPath, jsPath], { interval: 1000 }, parallel(scssTask, jsTask));
}

exports.style = style;
exports.watch = watchTut;

exports.scssTask = scssTask;
exports.jsTask = jsTask;
exports.copyHtml = copyHtml;
exports.imgTask = imgTask;
exports.default = series(
  parallel(copyHtml, imgTask, jsTask, scssTask),
  watchTask
);
