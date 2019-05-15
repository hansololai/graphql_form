export const isFunction = (funcToCheck)=>{
  if(!funcToCheck) return false;
  return {}.toString.call(funcToCheck) === '[object Function]';
}