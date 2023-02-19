const gulp = require('gulp');
const del = require('del');

const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));

const config = {
  paths: {
    src: {
      html: './src/*.html',
      css: ['./src/assets/styles/*.sass'],
      images: './src/assets/images/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}',
    },
    dest: {
      html: './public',
      images: './public/assets/images/',
    },
  },
};

gulp.task('html', function () {
  return gulp
    .src(config.paths.src.html)
    .pipe(gulp.dest(config.paths.dest.html));
});

gulp.task('images', function () {
  return gulp
    .src(config.paths.src.images)
    .pipe(gulp.dest(config.paths.dest.images));
});

gulp.task('images-prod', function (done) {
  const processor = require('compress-images');
  const options = { compress_force: false, statistic: true, autoupdate: true };

  processor(
    config.paths.src.images,
    config.paths.dest.images,
    options,
    false,
    { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
    { png: { engine: 'pngquant', command: ['--quality=20-50', '-o'] } },
    { svg: { engine: 'svgo', command: '--multipass' } },
    {
      gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] },
    },
    function (error) {
      if (error) {
        console.log(error);
      }
    }
  );

  done();
});

gulp.task('css', function () {
  let processors = [
    require('postcss-import'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ];

  return gulp
    .src(config.paths.src.css)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest(config.paths.dest.html));
});

gulp.task('clean', function () {
  return del([`${config.paths.dest.html}/**/*`]);
});

gulp.task('build', gulp.series('clean', 'html', 'css', 'images'));
gulp.task('build:prod', gulp.series('clean', 'html', 'css', 'images-prod'));

gulp.task('serve', () => {
  const browserSync = require('browser-sync').create();

  const refresh = (done) => {
    browserSync.reload();
    done();
  };

  browserSync.init({
    server: config.paths.dest.html,
  });

  return gulp.watch(['./src/**/*.*'], gulp.series('build', refresh));
});
