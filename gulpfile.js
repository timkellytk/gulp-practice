const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const autoprefixer = require("autoprefixer");
const { src, series, parallel, dest, watch } = require("gulp");

const htmlPath = "src/**/*.html";
const jsPath = "src/assets/js/**/*.js";
const scssPath = "src/assets/scss/**/*.scss";

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
  return src(scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(concat("style.css"))
    .pipe(postcss([autoprefixer(), cssnano()])) //not all plugins work with postcss only the ones mentioned in their documentation
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist/assets/css"))
    .pipe(browserSync.stream());
}

function watchTask() {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });
  watch(scssPath, scssTask);
  watch(htmlPath, copyHtml).on("change", browserSync.reload);
  watch(jsPath, jsTask).on("change", browserSync.reload);
}

exports.scssTask = scssTask;
exports.jsTask = jsTask;
exports.copyHtml = copyHtml;
exports.imgTask = imgTask;
exports.default = series(
  parallel(copyHtml, imgTask, jsTask, scssTask),
  watchTask
);
