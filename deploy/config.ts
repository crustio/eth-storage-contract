// load env file
import dotenv from "dotenv";
dotenv.config();

export function getInitializerData(
    contractInterface: Interface,
    args: unknown[],
    initializer?: string | false
): string {
    if (initializer === false) {
        return '0x';
    }

    const allowNoInitialization = initializer === undefined && args.length === 0;
    initializer = initializer ?? 'initialize';

    try {
        const fragment = contractInterface.getFunction(initializer);
        return contractInterface.encodeFunctionData(fragment, args);
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (allowNoInitialization && e.message.includes('no matching function')) {
                return '0x';
            }
        }
        throw e;
    }
}

const getParam = (name: string) => {
  const param = process.env[name];
  if (!param) {
    return null;
  }
  return param;
};

const getParamOrExit = (name: string) => {
  const param = process.env[name];
  if (!param) {
    console.error(`Required config param '${name}' missing`);
    process.exit(1);
  }
  return param;
};

export const zkSyncRPC = getParamOrExit("zkSyncRPC");
export const zkSyncNetwork = getParamOrExit("zkSyncNetwork");
export const zkSyncAccountPRV = getParamOrExit("zkSyncAccountPRV");
export const POCName = getParamOrExit("POCName");
export const SOCName = getParamOrExit("SOCName");
export const POCAddress = getParam("POCAddress");
export const SOCAddress = getParam("SOCAddress");
export const orderNode = getParam("orderNode");
