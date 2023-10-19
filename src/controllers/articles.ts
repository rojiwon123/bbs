import core from "@nestia/core";
import * as nest from "@nestjs/common";

import { ErrorCode } from "@APP/types/ErrorCode";
import { IArticle } from "@APP/types/IArticle";

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
    getList(
        @core.TypedQuery() query: IArticle.ISearch,
    ): Promise<IArticle.IPaginatedResponse> {
        query;
        throw Error();
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
    @core.TypedRoute.Post()
    create(@core.TypedBody() body: IArticle.ICreate): Promise<IArticle> {
        body;
        throw Error("");
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
    async getOne(
        @core.TypedParam("article_id") article_id: string,
    ): Promise<IArticle> {
        article_id;
        throw Error("");
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
    @core.TypedException<ErrorCode.InsufficientPermissions>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Put()
    async update(
        @core.TypedParam("article_id") article_id: string,
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
    @core.TypedException<ErrorCode.InsufficientPermissions>(
        nest.HttpStatus.FORBIDDEN,
    )
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Delete()
    async remove(
        @core.TypedParam("article_id") article_id: string,
    ): Promise<void> {
        article_id;
        throw Error("");
    }

    /**
     * get snapshot list of specific article found by article id
     *
     * only the author can find snapshots
     *
     * @summary find snapshot list
     * @tag articles
     * @security bearer
     * @param article_id identity of article
     * @return snapshot list of article
     */
    @core.TypedException<ErrorCode.Article.NotFound>(nest.HttpStatus.NOT_FOUND)
    @core.TypedRoute.Get("snapshots")
    getList(
        @core.TypedParam("article_id") article_id: string,
    ): Promise<IArticle.ISnapshot[]> {
        article_id;
        throw Error("");
    }
}
