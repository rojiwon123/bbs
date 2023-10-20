import core from "@nestia/core";
import * as nest from "@nestjs/common";
import typia from "typia";

import { Article } from "@APP/app/article";
import { Security } from "@APP/app/security";
import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";
import { Failure } from "@APP/utils/failure";
import { Result } from "@APP/utils/result";

@nest.Controller("articles")
export class ArticlesController {
    /**
     * get article list by filtering and sorting options.
     *
     * @summary get article list
     * @tag articles
     * @param query filtering and sorting options
     * @return paginated article list
     */
    @core.TypedRoute.Get()
    async getList(
        @core.TypedQuery() query: IArticle.ISearch,
    ): Promise<IArticle.IPaginatedResponse> {
        const result = await Article.getList(query);
        return Result.Ok.flatten(result);
    }

    /**
     * create a new article, the article have one snapshot.
     *
     * @summary create a new article
     * @tag articles
     * @security bearer
     * @param body article content
     * @return created article
     */
    @core.TypedException<
        | ErrorCode.Permission.Required
        | ErrorCode.Permission.Expired
        | ErrorCode.Permission.Invalid
    >(nest.HttpStatus.UNAUTHORIZED, "PERMISSION DENIED")
    @core.TypedRoute.Post()
    async create(
        @Security.HttpBearer() security: Security,
        @core.TypedBody() body: IArticle.ICreate,
    ): Promise<IArticle> {
        const token = Security.required(security);
        const user_id = Security.verify(token);
        const result = await Article.create()(user_id)(body);
        return Result.Ok.flatten(result);
    }
}

@nest.Controller("articles/:article_id")
export class ArticleController {
    /**
     * get a specific article by article id
     *
     * @summary get a article
     * @tag articles
     * @param article_id identity of article
     * @return found article
     */
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get()
    async get(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
    ): Promise<IArticle> {
        const result = await Article.get()({ article_id });
        if (Result.Ok.is(result)) return Result.Ok.flatten(result);
        const error = Result.Error.flatten(result);
        switch (error.message) {
            case "NOT_FOUND_ARTICLE":
                throw Failure.Http.fromInternal(
                    error,
                    nest.HttpStatus.NOT_FOUND,
                );
        }
    }

    /**
     * update a specific article found by article id
     *
     * only the author can update the article
     *
     * @summary update a article
     * @tag articles
     * @security bearer
     * @param article_id identity of article
     * @param body update content of article
     * @return updated article
     */
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Put()
    async update(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
        @core.TypedBody() body: IArticle.ICreate,
    ): Promise<IArticle> {
        article_id;
        body;
        throw Error("");
    }

    /**
     * delete a specific article found by article id
     *
     * only the author can delete the article
     *
     * @summary delete a article
     * @tag articles
     * @security bearer
     * @param article_id identity of article
     * @return none
     */
    @core.TypedException<ErrorCode.Permission.Insufficient>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Delete()
    async remove(
        @core.TypedParam("article_id")
        article_id: string & typia.tags.Format<"uuid">,
    ): Promise<void> {
        article_id;
        throw Error("");
    }
}
