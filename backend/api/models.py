from django.db import models

class ShortenedURL(models.Model):
    short_code = models.CharField(max_length=10, unique=True, db_index=True)
    original_url = models.URLField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    clicks = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'shortened_urls'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.short_code} -> {self.original_url}'