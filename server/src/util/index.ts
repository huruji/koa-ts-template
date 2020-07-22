import * as md5 from 'md5';
const MD5_SALT = '12345678901234567890123'


export function hash (content:string):string {
  const v1ResultMd5 = md5(`${content}_${MD5_SALT}`)
  const v2ResultMd5 = md5(`${v1ResultMd5}_${MD5_SALT}`)
  const v3ResultMd5 = md5(`${v2ResultMd5}_${MD5_SALT}`)
  return v3ResultMd5
}

export function parseAccountToUcid (account:string):string {
  let ucid = ''
  let accountMd5 = md5(account)
  accountMd5 = accountMd5.slice(0, 16)
  for (let index = 0; index < accountMd5.length; index++) {
    ucid += accountMd5.charCodeAt(index)
  }
  return ucid
}
