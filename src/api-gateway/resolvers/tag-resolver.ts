import { AuthenticationError, ValidationError } from "apollo-server-errors";
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query
} from "type-graphql";
import { TTag, TTagTemplate } from "../../types/tag";
import { Context } from "../api-gateway";

@InputType()
class CreateTagTemplateInput {
  @Field(_ => String)
  public name: string;

  @Field(_ => Boolean)
  public hasRate: boolean;
}

@InputType()
class CreateTagInput {
  @Field(_ => String)
  public templateId: string;

  @Field(_ => String)
  public contactId: string;

  @Field(_ => Number)
  public rate: number;
}

@InputType()
class DeleteTagInput {
  @Field(_ => String)
  id: string;
}

@InputType()
class DeleteTagTemplateInput {
  @Field(_ => String)
  id: string;
}

@InputType()
class RateTagInput {
  @Field(_ => String)
  id: string;

  @Field(_ => Number)
  rate: number;
}

@ArgsType()
class GetContactTags {
  @Field(_ => String)
  public contactId: string;
}

@ObjectType()
class TagTemplate implements TTagTemplate {
  @Field(_ => String)
  public id?: string;

  @Field(_ => String)
  public name: string;

  @Field(_ => String)
  public ownerId: string;

  @Field(_ => Boolean)
  hasRate: boolean;

  @Field(_ => Date)
  createAt?: Date;

  @Field(_ => Date)
  updateAt?: Date;
}

@ObjectType()
class ContactTag implements TTag {
  @Field(_ => String)
  public id?: string;

  @Field(_ => String)
  public name: string;

  @Field(_ => String)
  public templateId: string;

  @Field(_ => String)
  public ownerId: string;

  @Field(_ => Number)
  public rate: number;

  @Field(_ => String)
  public contactId: string;

  @Field(_ => Boolean)
  public hasRate: boolean;

  @Field(_ => Date)
  createAt?: Date;

  @Field(_ => Date)
  updateAt?: Date;
}

export class TagResolver {
  @Mutation(_ => TagTemplate)
  public async createTagTemplate(
    @Arg("createTagTemplateInput")
    createTagTemplateInput: CreateTagTemplateInput,
    @Ctx() { model, userId }: Context
  ): Promise<TagTemplate> {
    if (!userId) {
      throw new AuthenticationError(`please login to createTagTemplate`);
    }
    return model.tag.createTemplate({
      ...createTagTemplateInput,
      ownerId: userId
    });
  }

  @Mutation(_ => ContactTag)
  public async createTag(
    @Arg("createTagInput") createTagInput: CreateTagInput,
    @Ctx() { model, userId }: Context
  ): Promise<ContactTag> {
    if (!userId) {
      throw new AuthenticationError(`please login to createTag`);
    }
    const template = await model.tag.getTagTemplateById(
      createTagInput.templateId
    );
    if (!template) {
      throw new ValidationError("no template found");
    }
    return model.tag.createTag({
      ...createTagInput,
      name: template.name,
      ownerId: template.ownerId,
      hasRate: template.hasRate
    });
  }

  @Mutation(_ => Boolean)
  public async deleteTag(
    @Arg("deleteTagInput") deleteTagInput: DeleteTagInput,
    @Ctx() { model, userId }: Context
  ): Promise<boolean> {
    if (!userId) {
      throw new AuthenticationError(`please login to deleteTag`);
    }
    const { id } = deleteTagInput;
    return model.tag.deleteTag(id);
  }

  @Mutation(_ => Boolean)
  public async deleteTagTemplate(
    @Arg("deleteTagTemplateInput")
    deleteTagTemplateInput: DeleteTagTemplateInput,
    @Ctx() { model, userId }: Context
  ): Promise<boolean> {
    if (!userId) {
      throw new AuthenticationError(`please login deleteTagTemplate`);
    }
    return model.tag.deleteTemplate(deleteTagTemplateInput.id);
  }

  @Mutation(_ => ContactTag)
  public async rateTag(
    @Arg("rateTagInput") rateTagInput: RateTagInput,
    @Ctx() { model, userId }: Context
  ): Promise<ContactTag | null> {
    if (!userId) {
      throw new AuthenticationError(`please login to rateTag`);
    }
    return model.tag.findAndUpdateTagRate(rateTagInput);
  }

  @Query(_ => [TagTemplate])
  public async getUserTagTemplates(
    @Ctx() { model, userId }: Context
  ): Promise<Array<TagTemplate>> {
    if (!userId) {
      throw new AuthenticationError(`please login to getUserTagTemplates`);
    }
    return model.tag.getTemplatesByOwnerId(userId);
  }

  @Query(_ => [ContactTag])
  public async getContactTags(
    @Args() getContactTags: GetContactTags,
    @Ctx() { model, userId }: Context
  ): Promise<Array<ContactTag>> {
    if (!userId) {
      throw new AuthenticationError(`please login to getContactTags`);
    }
    return model.tag.getTagsByContactId(getContactTags.contactId);
  }
}
