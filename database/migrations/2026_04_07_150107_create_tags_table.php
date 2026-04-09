<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color', 7)->default('#6b7280');
            $table->timestamps();
        });

        Schema::create('tag_template', function (Blueprint $table) {
            $table->foreignId('template_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['template_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tag_template');
        Schema::dropIfExists('tags');
    }
};
