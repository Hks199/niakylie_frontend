# 🚀 NestJS Backend API Implementation Specification: Admin Category Management

> **Role**: Senior NestJS & MongoDB Architect  
> **Task**: Build and implement the production-grade NestJS Backend Module (`CategoriesModule`) with Mongoose, File Uploads (Multer), Ancestor Hierarchy Engine, Cascading Soft-Deletes, and No-Cache HTTP Headers required by the NiaKylie Admin Categories Dashboard (`AdminCategoriesPanel.tsx` & `CreateCategoryModal.tsx`).

---

## 📋 Table of Contents
1. [Target Endpoints & HTTP Contracts](#-target-endpoints--http-contracts)
2. [Mongoose Data Schema (`CategorySchema`)](#-mongoose-data-schema-categoryschema)
3. [Data Transfer Objects (DTOs)](#-data-transfer-objects-dtos)
4. [NestJS Controller Implementation](#-nestjs-controller-implementation)
5. [NestJS Service Implementation](#-nestjs-service-implementation)
6. [File Upload & Storage Architecture](#-file-upload--storage-architecture)
7. [Verification & cURL Testing Suite](#-verification--curl-testing-suite)

---

## 📡 Target Endpoints & HTTP Contracts

| HTTP Method | Route Endpoint | Payload Type | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Query Params | Fetch paginated categories with filtering & cache-control headers (`limit=500` support) |
| `GET` | `/api/v1/categories/tree` | None | Fetch complete 2-level hierarchy tree (Root categories with populated `subCategories`) |
| `GET` | `/api/v1/categories/:idOrSlug` | Path Param | Fetch single category detail by Mongo ID (`_id`) or URL `slug` |
| `POST` | `/api/v1/categories` | `multipart/form-data` | Create new Main (Level 1) or Sub (Level 2) Category with `image` & `banner` files |
| `PUT` | `/api/v1/categories/:id` | `multipart/form-data` | Update category metadata, status, SEO, and file replacements |
| `PATCH` | `/api/v1/categories/:id/toggle-active` | None | Instant toggle active/inactive status (`status: true / false`) |
| `DELETE` | `/api/v1/categories/:id` | Path Param | Cascading soft-delete (sets `isDeleted: true` for category & all child sub-categories) |

---

## 🗄️ Mongoose Data Schema (`CategorySchema`)

```ts
// src/categories/schemas/category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class CategoryAncestor {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  slug: string;
}

@Schema({ timestamps: true, toJSON: { getters: true, virtuals: true } })
export class Category {
  @Prop({ type: String, required: true, trim: true, index: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null, index: true })
  parentId: Types.ObjectId | null;

  @Prop({ type: [CategoryAncestor], default: [] })
  ancestors: CategoryAncestor[];

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: '' })
  image: string; // File URL path, e.g. "/uploads/categories/image-123.jpg"

  @Prop({ type: String, default: '' })
  banner: string; // File URL path, e.g. "/uploads/categories/banner-123.jpg"

  @Prop({ type: Number, default: 0, index: true })
  displayOrder: number;

  @Prop({ type: Boolean, default: true, index: true })
  status: boolean; // true = Active, false = Inactive

  @Prop({ type: String, default: '' })
  seoTitle: string;

  @Prop({ type: String, default: '' })
  seoDescription: string;

  @Prop({ type: [String], default: [] })
  seoKeywords: string[];

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean; // Soft-delete flag

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Compound Indexes for fast retrieval
CategorySchema.index({ isDeleted: 1, parentId: 1, status: 1, displayOrder: 1 });
CategorySchema.index({ name: 'text', description: 'text', slug: 'text' });
```

---

## 📝 Data Transfer Objects (DTOs)

### 1. `CreateCategoryDto`
```ts
// src/categories/dto/create-category.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  status?: boolean;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map((k) => k.trim()).filter(Boolean);
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  seoKeywords?: string[];
}
```

### 2. `QueryCategoryDto`
```ts
// src/categories/dto/query-category.dto.ts
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 500;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  sort?: string = '-createdAt';

  @IsOptional()
  @IsString()
  _t?: string; // Whitelisted cache-busting timestamp parameter
}
```

---

## ⚡ NestJS Controller Implementation (`CategoriesController`)

```ts
// src/categories/categories.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Header,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

const storage = diskStorage({
  destination: './uploads/categories',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async findAll(@Query() queryDto: QueryCategoryDto) {
    return this.categoriesService.findAll(queryDto);
  }

  @Get('tree')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  async getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.categoriesService.findByIdOrSlug(idOrSlug);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ],
      { storage },
    ),
  )
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    const imagePath = files?.image?.[0] ? `/uploads/categories/${files.image[0].filename}` : '';
    const bannerPath = files?.banner?.[0] ? `/uploads/categories/${files.banner[0].filename}` : '';
    return this.categoriesService.create(createCategoryDto, imagePath, bannerPath);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ],
      { storage },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    const imagePath = files?.image?.[0] ? `/uploads/categories/${files.image[0].filename}` : undefined;
    const bannerPath = files?.banner?.[0] ? `/uploads/categories/${files.banner[0].filename}` : undefined;
    return this.categoriesService.update(id, updateCategoryDto, imagePath, bannerPath);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.categoriesService.toggleActive(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.softDelete(id);
  }
}
```

---

## 🧠 NestJS Service Implementation (`CategoriesService`)

```ts
// src/categories/categories.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  async create(dto: CreateCategoryDto, imagePath: string, bannerPath: string): Promise<Category> {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    
    // Check slug uniqueness
    const existing = await this.categoryModel.findOne({ slug, isDeleted: false });
    if (existing) {
      throw new BadRequestException(`Category with slug '${slug}' already exists.`);
    }

    let parentIdVal: Types.ObjectId | null = null;
    let ancestors: any[] = [];

    if (dto.parentId && dto.parentId !== 'null' && dto.parentId !== 'undefined') {
      const parent = await this.categoryModel.findOne({ _id: dto.parentId, isDeleted: false });
      if (!parent) {
        throw new NotFoundException(`Parent category '${dto.parentId}' not found.`);
      }
      parentIdVal = parent._id as Types.ObjectId;
      ancestors = [...(parent.ancestors || []), { _id: parent._id, name: parent.name, slug: parent.slug }];
    }

    const created = new this.categoryModel({
      ...dto,
      slug,
      parentId: parentIdVal,
      ancestors,
      image: imagePath,
      banner: bannerPath,
      isDeleted: false,
      deletedAt: null,
    });

    return created.save();
  }

  async findAll(queryDto: QueryCategoryDto) {
    const { page = 1, limit = 500, search, parentId, status, sort = '-createdAt' } = queryDto;
    const filter: any = { isDeleted: false };

    if (status !== undefined) filter.status = status;
    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') filter.parentId = null;
      else filter.parentId = new Types.ObjectId(parentId);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await this.categoryModel.countDocuments(filter);
    const data = await this.categoryModel
      .find(filter)
      .populate('parentId', 'name slug _id')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getTree(): Promise<any[]> {
    const categories = await this.categoryModel
      .find({ isDeleted: false })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const rootCategories = categories.filter(
      (c) => !c.parentId || c.parentId.toString() === 'null',
    );

    return rootCategories.map((root) => {
      const subCategories = categories.filter(
        (c) => c.parentId && c.parentId.toString() === root._id.toString(),
      );
      return {
        ...root,
        subCategories,
      };
    });
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Category> {
    const isObjectId = Types.ObjectId.isValid(idOrSlug);
    const filter = isObjectId ? { _id: idOrSlug, isDeleted: false } : { slug: idOrSlug, isDeleted: false };
    const category = await this.categoryModel.findOne(filter).populate('parentId', 'name slug _id');
    if (!category) {
      throw new NotFoundException(`Category '${idOrSlug}' not found.`);
    }
    return category;
  }

  async toggleActive(id: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ _id: id, isDeleted: false });
    if (!category) {
      throw new NotFoundException(`Category '${id}' not found.`);
    }
    category.status = !category.status;
    return category.save();
  }

  async softDelete(id: string): Promise<{ success: boolean; message: string }> {
    const category = await this.categoryModel.findOne({ _id: id, isDeleted: false });
    if (!category) {
      throw new NotFoundException(`Category '${id}' not found.`);
    }

    const now = new Date();
    // Cascading soft-delete: Soft delete main category & all child sub-categories
    await this.categoryModel.updateMany(
      { $or: [{ _id: id }, { parentId: id }] },
      { $set: { isDeleted: true, deletedAt: now } },
    );

    return {
      success: true,
      message: `Category '${category.name}' and its child sub-categories have been deleted successfully.`,
    };
  }
}
```

---

## 🧪 Verification & cURL Testing Suite

### 1. Test Fetch Paginated Categories (`limit=500`)
```bash
curl -X GET "http://localhost:3000/api/v1/categories?limit=500" \
  -H "Cache-Control: no-cache"
```

### 2. Test Fetch 2-Level Tree
```bash
curl -X GET "http://localhost:3000/api/v1/categories/tree" \
  -H "Cache-Control: no-cache"
```

### 3. Test Create Category with File Upload
```bash
curl -X POST "http://localhost:3000/api/v1/categories" \
  -F "name=Ethnic Sarees" \
  -F "slug=ethnic-sarees" \
  -F "description=Premium ethnic sarees catalog" \
  -F "status=true" \
  -F "image=@/path/to/thumbnail.jpg" \
  -F "banner=@/path/to/banner.jpg"
```

### 4. Test Toggle Active Status
```bash
curl -X PATCH "http://localhost:3000/api/v1/categories/60d5ecb8b392d40015f8a001/toggle-active"
```

### 5. Test Cascading Soft Delete
```bash
curl -X DELETE "http://localhost:3000/api/v1/categories/60d5ecb8b392d40015f8a001"
```
