import { Request, Response, NextFunction } from "express";
import shortid = require("shortid");

export function requestIdInterceptor(namespace: any) {
    return (req: Request, res: Response, next: NextFunction) => {
        namespace.run(() => {
            const incomingRequestId = req.header("requestId");
            const requestId = incomingRequestId || shortid.generate();
            namespace.set("requestId", requestId);
            next();
        });
    }
}
