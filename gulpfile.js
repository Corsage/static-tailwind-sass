const gulp = require('gulp');

const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));

const config = {
  paths: {
    src: {
      html: './src/*.html',
      css: ['./src/assets/styles/*.sass'],
    },
    dest: './public',
  },
};

gulp.task('html', function () {
  return gulp.src(config.paths.src.html).pipe(gulp.dest(config.paths.dest));
});

gulp.task('css', function () {
  var processors = [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ];

  return gulp
    .src(config.paths.src.css)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest(config.paths.dest));
});

gulp.task('build', gulp.series('html', 'css'));

gulp.task('serve', () => {
  const browserSync = require('browser-sync').create();

  const refresh = (done) => {
    browserSync.reload();
    done();
  };

  browserSync.init({
    server: config.paths.dest,
  });

  return gulp.watch(['./src/**/*.*'], gulp.series('build', refresh));
});
