// https://github.com/pnpm/pnpm/issues/2695

const readPackage = (pkg, context) => {
  if (pkg.name !== '@busse/monorepo') {
    removeDep(pkg, '@nestjs/apollo')
    removeDep(pkg, '@nestjs/axios')
    removeDep(pkg, '@nestjs/cli')
    removeDep(pkg, '@nestjs/common')
    removeDep(pkg, '@nestjs/config')
    removeDep(pkg, '@nestjs/core')
    removeDep(pkg, '@nestjs/graphql')
    removeDep(pkg, '@nestjs/microservices')
    removeDep(pkg, '@nestjs/passport')
    removeDep(pkg, '@nestjs/platform-express')
    removeDep(pkg, '@nestjs/schedule')
    removeDep(pkg, '@nestjs/schematics')
    removeDep(pkg, '@nestjs/swagger')
    removeDep(pkg, '@nestjs/terminus')
    removeDep(pkg, '@nestjs/testing')
    removeDep(pkg, '@types/react-dom')
    removeDep(pkg, '@types/rxjs')
    removeDep(pkg, 'axios')
    removeDep(pkg, 'class-transformer')
    removeDep(pkg, 'class-validator')
    removeDep(pkg, 'express')
    removeDep(pkg, 'passport')
    removeDep(pkg, 'react-dom')
    removeDep(pkg, 'react')
    removeDep(pkg, 'reflect-metadata')
    removeDep(pkg, 'rxjs')
  }

  return pkg;
};

function removeDep(pkg, name) {
  delete pkg.dependencies?.[name];
  delete pkg.devDependencies?.[name];
  delete pkg.peerDependencies?.[name];
  delete pkg.dependenciesMeta?.[name];
}

module.exports = {
  hooks: {
    readPackage
  }
};
